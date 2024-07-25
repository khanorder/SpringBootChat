using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Supervisor.Models;
using Supervisor.Server.Models;
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Supervisor.Server.Services
{
    class SocketServer : IHostedService, IDisposable
    {
        private ILogger<SocketServer> _logger;
        private IConfiguration _configuration;
        private Config _config;
        private Thread _thread;
        public bool isRunning = false;

        public SocketServer(ILogger<SocketServer> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _config = _configuration.GetSection("Config").Get<Config>();
            _thread = new Thread(Run) { IsBackground = true };
        }

        async void Run()
        {
            if (null == _config)
            {
                var excptConfig = new Exception("Need to set the Config data on the appsettings.json file.");
                _logger.LogError(excptConfig.Message, excptConfig);
                throw excptConfig;
            }

            if (ServerOS.None == _config.ServerOS)
            {
                var excptOS = new Exception("Need to set server OS type data.");
                _logger.LogError(excptOS.Message, excptOS);
                throw excptOS;
            }
            _logger.LogInformation($"os : {_config.ServerOS}");

            if (5659 > _config.ServerPort)
            {
                var excptPort = new Exception("Need to set server port number lower than 5659.");
                _logger.LogError(excptPort.Message, excptPort);
                throw excptPort;
            }
            _logger.LogInformation($"port : {_config.ServerPort}");

            if (string.IsNullOrWhiteSpace(_config.BasePath))
            {
                var excptBasePath = new Exception("Need to set service directory path.");
                _logger.LogError(excptBasePath.Message, excptBasePath);
                throw excptBasePath;
            }
            _logger.LogInformation($"path : {_config.BasePath}");

            if (false == Directory.Exists(_config.BasePath))
            {
                var excptBasePathExists = new Exception("No exists service directory.");
                _logger.LogError(excptBasePathExists.Message, excptBasePathExists);
                throw excptBasePathExists;
            }

            // (1) 소켓 객체 생성 (TCP 소켓)
            TcpListener tcpListener = null;
            try
            {
                tcpListener = new TcpListener(new IPEndPoint(IPAddress.Any, _config.ServerPort));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return;
            }

            tcpListener.Start();

            // (4) 연결을 받아들여 새 소켓 생성 (하나의 연결만 받아들임)
            while (isRunning)
            {
                var socket = tcpListener.AcceptSocket();
                try
                {
                    var networkStream = new NetworkStream(socket);
                    var streamReader = new StreamReader(networkStream);

                    string jsonData = streamReader.ReadLine();
                    var packetData = JsonConvert.DeserializeObject<PacketData>(jsonData);

                    switch ((ClientReq)packetData.Type)
                    {
                        case ClientReq.StopServer:
                            await OnStopServerReq(networkStream, packetData);
                            break;

                        case ClientReq.StartServer:
                            await OnStartServerReq(networkStream, packetData);
                            break;

                        case ClientReq.Unzip:
                            await OnUnzipReq(networkStream, packetData);
                            break;

                        case ClientReq.InstallNPMPackage:
                            await OnInstallNPMPackageReq(networkStream, packetData);
                            break;

                        case ClientReq.Test:
                            await OnTestReq(networkStream, packetData);
                            break;

                        default:
                            break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message);
                }
                // (7) 소켓 닫기
                socket.Close();
            }

            // (7) 소켓 닫기
            tcpListener.Stop();
        }

        async Task SendSocket<T>(NetworkStream networkStream, T data) where T : class
        {
            var streamWriter = new StreamWriter(networkStream);
            try
            {
                await streamWriter.WriteLineAsync(JsonConvert.SerializeObject(data));
                streamWriter.Flush();
            }
            catch (Exception ex)
            {
                _logger.LogError($"SendSocket : {ex.Message}", ex);
            }
        }

        async Task OnStopServerReq(NetworkStream networkStream, PacketData reqData)
        {
            var ack = new PacketData
            {
                Type = (int)ServerAck.StopServer
            };

            var serverControlAck = new ServerControlAck
            {
                ServerName = reqData.ServerName
            };

            var result = await ControlService(reqData, ServerServiceMode.Stop);
            serverControlAck.RunningOK = 0 == result;
            _logger.LogInformation($"{reqData.ServerName} stop {0 == result}");

            ack.Data = JsonConvert.SerializeObject(serverControlAck);
            await SendSocket(networkStream, ack);
        }

        async Task OnStartServerReq(NetworkStream networkStream, PacketData reqData)
        {
            var ack = new PacketData
            {
                Type = (int)ServerAck.StartServer
            };

            var serverControlAck = new ServerControlAck
            {
                ServerName = reqData.ServerName
            };

            var result = await ControlService(reqData, ServerServiceMode.Start);
            serverControlAck.RunningOK = 0 == result;
            _logger.LogInformation($"{reqData.ServerName} start {0 == result}");

            ack.Data = JsonConvert.SerializeObject(serverControlAck);
            await SendSocket(networkStream, ack);
        }

        async Task OnUnzipReq(NetworkStream networkStream, PacketData reqData)
        {
            var ack = new PacketData
            {
                Type = (int)ServerAck.Unzip
            };

            var serverControlAck = new ServerControlAck
            {
                ServerName = reqData.ServerName
            };

            ack.Data = JsonConvert.SerializeObject(serverControlAck);
            try
            {
                var zipSource = Path.Combine(_config.BasePath, "Compress", $"{reqData.ServerName}.zip");
                var serverPath = Path.Combine(_config.BasePath, reqData.ServerName);
                var serverBinayPath = "";
                switch (_config.ServerOS)
                {
                    case ServerOS.Linux:
                        serverBinayPath = Path.Combine(_config.BasePath, reqData.ServerName, reqData.ExcuteFileName);
                        break;

                    case ServerOS.Windows:
                        if (ProjectType.DotNet == reqData.ProjectType)
                        {
                            serverBinayPath = Path.Combine(_config.BasePath, reqData.ServerName, reqData.ExcuteFileName + ".exe");
                        }
                        else
                        {
                            serverBinayPath = Path.Combine(_config.BasePath, reqData.ServerName, reqData.ExcuteFileName);
                        }
                        break;
                }

                //if (false == File.Exists(serverBinayPath) && false == File.Exists(serverBinayPath + ".dll"))
                //{
                //    _logger.LogError($"Not found service file.({serverBinayPath})");
                //    if (File.Exists(zipSource))
                //        File.Delete(zipSource);
                //    return;
                //}

                var cachePath = Path.Combine(serverPath, "CacheFiles");
                var logPath = Path.Combine(serverPath, "logs");
                var modulePath = Path.Combine(serverPath, "node_modules");
                var wwwrootPath = Path.Combine(serverPath, "wwwroot");
                switch (reqData.ProjectType)
                {
                    case ProjectType.NodeJS:
                        wwwrootPath = Path.Combine(serverPath, "public");
                        break;

                    case ProjectType.SpringBoot:
                        wwwrootPath = Path.Combine(serverPath, "resources");
                        break;
                }
                var cssPath = Path.Combine(wwwrootPath, "css");
                var filesPath = Path.Combine(wwwrootPath, "files");
                var imagesPath = Path.Combine(wwwrootPath, "images");
                var videosPath = Path.Combine(wwwrootPath, "videos");
                var audiosPath = Path.Combine(wwwrootPath, "audios");
                var fontsPath = Path.Combine(wwwrootPath, "fonts");
                var jsPath = Path.Combine(wwwrootPath, "js");
                var libPath = Path.Combine(wwwrootPath, "lib");
                var scriptsPath = Path.Combine(serverPath, "scripts");
                var configsPath = Path.Combine(serverPath, "configs");
                var uploadImagePath = Path.Combine(serverPath, "images");

                var dirs = Directory.GetDirectories(serverPath);
                // var dbSettingsRegex = new Regex(@"(\\|/)\.dbSettings\.json", RegexOptions.IgnoreCase);
                var jsonConfigRegex = new Regex(@"(\\|/)(?!(navmenu|jwt))([a-z])+(settings)([a-z\.])*\.json", RegexOptions.IgnoreCase);
                var navMenuSettingsRegex = new Regex(@"(\\|/)(navmenusettings)([a-z\.])*\.json", RegexOptions.IgnoreCase);
                var navMenuSettingsOnlyRegex = new Regex(@"(\\|/)(navmenusettings)\.json", RegexOptions.IgnoreCase);
                var jwtSettingsRegex = new Regex(@"(\\|/)(jwtsettings)([a-z\.])*\.json", RegexOptions.IgnoreCase);
                var jwtSettingsOnlyRegex = new Regex(@"(\\|/)(jwtsettings)\.json", RegexOptions.IgnoreCase);

                if (0 < reqData.includeFolders.Count)
                {
                    foreach (var dir in dirs)
                    {
                        var dirPath = Path.Combine(serverPath, dir);
                        if (reqData.includeFolders.Contains(IncludeFolder.scripts) && dirPath == scriptsPath)
                        {
                            if (Directory.Exists(dirPath))
                            {
                                try
                                {
                                    Directory.Delete(dirPath, true);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex.Message);
                                }
                            }
                        }

                        if (reqData.includeFolders.Contains(IncludeFolder.images) && dirPath == imagesPath)
                        {
                            if (Directory.Exists(dirPath))
                            {
                                try
                                {
                                    Directory.Delete(dirPath, true);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex.Message);
                                }
                            }
                        }

                        if (reqData.includeFolders.Contains(IncludeFolder.videos) && dirPath == videosPath)
                        {
                            if (Directory.Exists(dirPath))
                            {
                                try
                                {
                                    Directory.Delete(dirPath, true);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex.Message);
                                }
                            }
                        }

                        if (reqData.includeFolders.Contains(IncludeFolder.audios) && dirPath == audiosPath)
                        {
                            if (Directory.Exists(dirPath))
                            {
                                try
                                {
                                    Directory.Delete(dirPath, true);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex.Message);
                                }
                            }
                        }

                        if (reqData.includeFolders.Contains(IncludeFolder.fonts) && dirPath == fontsPath)
                        {
                            if (Directory.Exists(dirPath))
                            {
                                try
                                {
                                    Directory.Delete(dirPath, true);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex.Message);
                                }
                            }
                        }
                    }

                    var files = Directory.GetFiles(serverPath);
                    foreach (var file in files)
                    {
                        var filePath = Path.Combine(serverPath, file);
                        if (reqData.includeFolders.Contains(IncludeFolder.navmenusettings) && navMenuSettingsOnlyRegex.IsMatch(filePath))
                        {
                            if (File.Exists(filePath))
                            {
                                try
                                {
                                    Directory.Delete(filePath, true);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex.Message);
                                }
                            }
                        }

                        if (reqData.includeFolders.Contains(IncludeFolder.jwtsettings) && jwtSettingsOnlyRegex.IsMatch(filePath))
                        {
                            if (File.Exists(filePath))
                            {
                                try
                                {
                                    Directory.Delete(filePath, true);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex.Message);
                                }
                            }
                        }
                    }
                }
                else
                {
                    foreach (var dir in dirs)
                    {
                        var dirPath = Path.Combine(serverPath, dir);
                        if (dirPath == cachePath)
                            continue;

                        if (dirPath == logPath)
                            continue;

                        if (dirPath == modulePath)
                            continue;

                        if (dirPath == configsPath)
                            continue;

                        if (dirPath == uploadImagePath)
                            continue;

                        if (dirPath == wwwrootPath)
                        {
                            var staticDirs = Directory.GetDirectories(dirPath);
                            foreach (string staticDir in staticDirs)
                            {
                                var staticDirPath = Path.Combine(dirPath, staticDir);

                                if (staticDirPath == filesPath)
                                    continue;

                                if (ProjectType.DotNet == reqData.ProjectType)
                                {
                                    if (staticDirPath == cssPath)
                                        continue;
                                }

                                if (staticDirPath == jsPath)
                                    continue;

                                if (staticDirPath == imagesPath)
                                    continue;

                                if (staticDirPath == videosPath)
                                    continue;

                                if (staticDirPath == audiosPath)
                                    continue;

                                if (staticDirPath == fontsPath)
                                    continue;

                                if (staticDirPath == libPath)
                                    continue;

                                if (Directory.Exists(staticDirPath))
                                {
                                    try
                                    {
                                        Directory.Delete(staticDirPath, true);
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger.LogError(ex.Message);
                                    }
                                }
                            }

                            var staticFiles = Directory.GetFiles(dirPath);
                            foreach (var staticFile in staticFiles)
                            {
                                var staticFilePath = Path.Combine(serverPath, staticFile);
                                if (File.Exists(staticFilePath))
                                {
                                    try
                                    {
                                        File.Delete(staticFilePath);
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger.LogError(ex.Message);
                                    }
                                }

                            }
                            continue;
                        }

                        if (Directory.Exists(dirPath) && dirPath != wwwrootPath && dirPath != cachePath && dirPath != logPath)
                        {
                            try
                            {
                                Directory.Delete(dirPath, true);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex.Message);
                            }
                        }
                    }

                    var files = Directory.GetFiles(serverPath);
                    foreach (var file in files)
                    {
                        var filePath = Path.Combine(serverPath, file);
                        if (jsonConfigRegex.IsMatch(filePath))
                            continue;

                        if (navMenuSettingsRegex.IsMatch(filePath))
                            continue;

                        if (jwtSettingsRegex.IsMatch(filePath))
                            continue;

                        if (filePath == Path.Combine(serverPath, ".dbSettings.json"))
                            continue;

                        if (filePath == Path.Combine(serverPath, "web.config"))
                            continue;

                        if (filePath == Path.Combine(serverPath, ".env"))
                            continue;

                        if (filePath == Path.Combine(serverPath, "packgage-lock.json"))
                            continue;

                        if (File.Exists(filePath))
                        {
                            try
                            {
                                File.Delete(filePath);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex.Message);
                            }
                        }
                    }
                }

                await Unzip(zipSource, serverPath);
                if (ProjectType.DotNet == reqData.ProjectType && ServerOS.Linux == _config.ServerOS)
                    await Chmod(serverBinayPath);

                // 압축 파일 삭제
                if (File.Exists(zipSource))
                    File.Delete(zipSource);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }

            await SendSocket(networkStream, ack);
        }

        async Task OnInstallNPMPackageReq(NetworkStream networkStream, PacketData reqData)
        {
            var ack = new PacketData
            {
                Type = (int)ServerAck.InstallNPMPackage
            };

            var serverControlAck = new ServerControlAck
            {
                ServerName = reqData.ServerName
            };

            if (ProjectType.NodeJS == reqData.ProjectType)
            {
                try
                {
                    serverControlAck.RunningOK = await NPMInstall(reqData);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message);
                }
            }
            else
            {
                serverControlAck.RunningOK = false;
            }

            ack.Data = JsonConvert.SerializeObject(serverControlAck);
            await SendSocket(networkStream, ack);
        }

        async Task OnTestReq(NetworkStream networkStream, PacketData reqData)
        {
            _logger.LogInformation($"Test : succeed");
            var ack = new PacketData
            {
                Type = (int)ServerAck.Test
            };

            var serverControlAck = new ServerControlAck
            {
                ServerName = reqData.ServerName
            };

            var result = await ControlService(reqData, ServerServiceMode.Status);
            serverControlAck.RunningOK = 0 == result;
            _logger.LogInformation($"{reqData.ServerName} status");

            ack.Data = JsonConvert.SerializeObject(serverControlAck);
            await SendSocket(networkStream, ack);
        }

        async Task<int> ControlService(PacketData packetData, ServerServiceMode mode)
        {
            var servicePath = "";
            switch (_config.ServerOS)
            {
                case ServerOS.Linux:
                    servicePath = Path.Combine("/etc/systemd/system", $"{packetData.ServiceName}.service");
                    break;

                case ServerOS.Windows:
                    servicePath = Path.Combine(_config.BasePath, packetData.ServerName, $"{packetData.ExcuteFileName}.exe");
                    break;

                default:
                    return 1;
            }

            if (false == File.Exists(servicePath))
            {
                _logger.LogInformation($"No service: {packetData.ServiceName} to {mode}");
                return 1;
            }

            var psi = new ProcessStartInfo();
            switch (_config.ServerOS)
            {
                case ServerOS.Linux:
                    psi.FileName = "systemctl";
                    psi.Arguments = $"{mode.ToString().ToLower()} {packetData.ServiceName}";
                    break;

                case ServerOS.Windows:
                    switch (packetData.ServiceType)
                    {
                        case ServiceType.Native:
                            psi.FileName = "net.exe";
                            psi.Arguments = $"{mode.ToString().ToLower()} {packetData.ServiceName}";
                            break;

                        case ServiceType.IIS:
                            psi.FileName = "C:\\Windows\\System32\\inetsrv\\appcmd.exe";
                            psi.Arguments = $"{mode.ToString().ToLower()} site {packetData.ServiceName}";
                            break;
                    }

                    break;

                default:
                    return 1;
            }
            psi.RedirectStandardOutput = true;

            var process = new Process { StartInfo = psi };

            process.Start();
            process.WaitForExit();
            _logger.LogInformation($"exitCode : {process.ExitCode}");
            return process.ExitCode;
        }

        async Task<bool> Unzip(string sourceZipFile, string destinationFolder)
        {
            if (string.IsNullOrEmpty(destinationFolder))
                return false;

            if (string.IsNullOrEmpty(sourceZipFile))
                return false;

            if (false == File.Exists(sourceZipFile))
                return false;

            if (false == Directory.Exists(destinationFolder))
                return false;

            var result = false;

            switch (_config.ServerOS)
            {
                case ServerOS.Linux:
                    var psi = new ProcessStartInfo
                    {
                        FileName = "unzip",
                        Arguments = $"-oq {sourceZipFile} -d {destinationFolder}"
                    };

                    var process = new Process
                    {
                        StartInfo = psi
                    };

                    process.Start();
                    process.WaitForExit();
                    _logger.LogInformation($"unzip exitCode : {process.ExitCode}");
                    result = 0 == process.ExitCode;
                    break;

                case ServerOS.Windows:
                    ZipFile.ExtractToDirectory(sourceZipFile, destinationFolder, true);
                    break;

                default:
                    return false;
            }
            // 압축 파일 삭제
            if (File.Exists(sourceZipFile))
                File.Delete(sourceZipFile);

            return result;
        }

        async Task<bool> Chmod(string binaryPath)
        {
            if (string.IsNullOrEmpty(binaryPath))
                return false;

            if (false == File.Exists(binaryPath))
                return false;

            var psi = new ProcessStartInfo
            {
                FileName = "chmod",
                Arguments = $"0755 {binaryPath}"
            };

            var process = new Process
            {
                StartInfo = psi
            };
            process.Start();
            process.WaitForExit();
            _logger.LogInformation($"chmod exitCode : {process.ExitCode}");
            return 0 == process.ExitCode;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation($"SocketServer: StartAsync has been called.");
            isRunning = true;
            _thread.Start();

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation($"SocketServer: StopAsync has been called.");
            isRunning = false;

            return Task.CompletedTask;
        }

        async Task<bool> NPMInstall(PacketData serverData)
        {
            var serverPath = Path.Combine(_config.BasePath, serverData.ServerName);

            if (string.IsNullOrEmpty(serverPath))
                return false;

            var packageFilePath = Path.Combine(serverPath, "package.json");
            if (false == File.Exists(packageFilePath))
            {
                _logger.LogError($"'{packageFilePath}' : file not exists.");
                return false;
            }

            var result = false;

            switch (_config.ServerOS)
            {
                default:
                    var nodePath = "/bin";
                    var localNodePath = "/usr/local/bin/node";

                    if (false == File.Exists($"{nodePath}/node") && false == File.Exists($"{nodePath}/npm"))
                    {
                        var getNPMInfoPsi = new ProcessStartInfo
                        {
                            FileName = "find",
                            Arguments = $"/root/.nvm/versions/node -name v{(string.IsNullOrWhiteSpace(serverData.CoreVersion) ? "16" : serverData.CoreVersion)}*",
                            RedirectStandardOutput = true
                        };

                        var getNPMInfoProcess = new Process
                        {
                            StartInfo = getNPMInfoPsi
                        };

                        getNPMInfoProcess.Start();

                        List<string> npmInfoOutputs = new List<string>();
                        while (!getNPMInfoProcess.StandardOutput.EndOfStream)
                        {
                            npmInfoOutputs.Add(getNPMInfoProcess.StandardOutput.ReadLine());
                        }

                        getNPMInfoProcess.WaitForExit();

                        if (0 != getNPMInfoProcess.ExitCode)
                        {
                            _logger.LogError($"get npm info exitCode : {getNPMInfoProcess.ExitCode}");
                            return false;
                        }

                        if (1 > npmInfoOutputs.Count)
                        {
                            _logger.LogError($"a available npm not exists.");
                            return false;
                        }

                        nodePath = $"{npmInfoOutputs[0]}/bin";
                        _logger.LogInformation($"nodePath: {nodePath}");
                    }

                    if (false == File.Exists(localNodePath))
                    {
                        var applyLNPsi = new ProcessStartInfo
                        {
                            FileName = "ln",
                            Arguments = $"-s {nodePath}/node {localNodePath}",
                            RedirectStandardOutput = true
                        };

                        var applyLNProcess = new Process
                        {
                            StartInfo = applyLNPsi
                        };

                        applyLNProcess.Start();
                        applyLNProcess.WaitForExit();

                        if (0 != applyLNProcess.ExitCode)
                        {
                            _logger.LogError($"apply local node exitCode : {applyLNProcess.ExitCode}");
                            return false;
                        }
                    }

                    if (false == File.Exists(localNodePath))
                    {
                        _logger.LogError($"not found local node.");
                        return false;
                    }

                    var psi = new ProcessStartInfo
                    {
                        FileName = $"{nodePath}/npm",
                        Arguments = $"--prefix {serverPath} install",
                        RedirectStandardOutput = true
                    };

                    var process = new Process
                    {
                        StartInfo = psi
                    };

                    process.Start();

                    while (!process.StandardOutput.EndOfStream)
                    {
                        _logger.LogInformation($"install output: {process.StandardOutput.ReadLine()}");
                    }

                    process.WaitForExit();

                    result = 0 == process.ExitCode;
                    break;
            }

            return result;
        }

        public void Dispose()
        {
            isRunning = false;
        }

    }
}
