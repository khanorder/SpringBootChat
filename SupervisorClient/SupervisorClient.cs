using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Supervisor.Client.Models;
using Supervisor.Client.Services;
using Supervisor.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Forms;
using FluentFTP;

namespace Supervisor.Client
{
    public partial class SupervisorClient : Form
    {
        private ILogger<SupervisorClient> _logger;
        private Config _config;
        private ConfigService _configService;
        private ServerData _selectedServer;
        private ZipHelper _zipHelper;
        string _compressFilePath { get; set; }

        public SupervisorClient(ILogger<SupervisorClient> logger, Config config, ConfigService configService, ZipHelper zipHelper)
        {
            _logger = logger;
            _config = config;
            _configService = configService;
            _selectedServer = _config.ServerList.First();
            _zipHelper = zipHelper;
            _compressFilePath = Path.Combine(AppContext.BaseDirectory, _selectedServer.Name + ".zip");

            InitializeComponent();

            ProjectPathTextBox.Text = _selectedServer.ProjectPath;
            UpdateIncludeFolderSelector();

            for (var i = 0; i < _config.ServerList.Count; i++)
            {
                var server = _config.ServerList[i];
                ServerListComboBox.Items.Add($"{server.DisplayName} [{server.ServiceName}({server.Host}) : {server.ServiceType} : {server.ProjectType}{(server.LanguageVersion > 0 ? $"({server.LanguageVersion.ToString("#.0")})" : "")}]");

                if (server.Uid == _selectedServer.Uid)
                    ServerListComboBox.SelectedIndex = i;
            }
        }

        private void ProjectTextBoxChanged(object sender, EventArgs e)
        {
            _selectedServer.ProjectPath = ProjectPathTextBox.Text;
            _configService.SaveConfig();
        }

        private void ProjectTextBoxLostFocus(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(ProjectPathTextBox.Text))
            {
                return;
            }

            if (false == Directory.Exists(ProjectPathTextBox.Text))
            {
                MessageBox.Show("입력한 경로의 디렉토리가 없습니다.");
                return;
            }

            //var linuxBinary = Path.Combine(ProjectPathTextBox.Text, _selectedServer.ExcuteFileName);
            //var windowsBinary = Path.Combine(ProjectPathTextBox.Text, $"{_selectedServer.ExcuteFileName}.dll");
            //var windowsExe = Path.Combine(ProjectPathTextBox.Text, $"{_selectedServer.ExcuteFileName}.exe");
            //if (false == File.Exists(linuxBinary) && false == File.Exists(windowsBinary) && false == File.Exists(windowsExe))
            //{
            //    MessageBox.Show("프로젝트 파일이 없습니다.");
            //    return;
            //}
        }

        private bool CheckSelectedServer()
        {
            if (null == _selectedServer)
            {
                MessageBox.Show("선택된 서버가 없습니다.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(_selectedServer.Name))
            {
                MessageBox.Show("서버 이름이 없습니다.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(_selectedServer.Host))
            {
                MessageBox.Show("서버 주소가 없습니다.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(_selectedServer.User))
            {
                MessageBox.Show("서버 접속 계정이 없습니다.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(_selectedServer.Pass))
            {
                MessageBox.Show("서버 접속 비밀번호가 없습니다.");
                return false;
            }

            return true;
        }

        private void UpdatePatchState(bool state, string message)
        {
            SetButton(state);
            MessageBox.Show(message);
        }

        private void UpdatePatchState(bool state, string message, int progress)
        {
            UpdatePatchState(state, message);
            PatchProgressBar.Value = progress;
        }

        private async void PatchServer()
        {
            SetButton(false);
            PatchProgressBar.Value = 0;

            if (string.IsNullOrWhiteSpace(_selectedServer.ProjectPath))
            {
                UpdatePatchState(true, "프로젝트 경로를 지정해 주세요.");
                return;
            }

            if (false == Directory.Exists(_selectedServer.ProjectPath))
            {
                UpdatePatchState(true, "프로젝트 폴더를 생성해 주세요.");
                return;
            }

            switch (_selectedServer.ProjectType)
            {
                case ProjectType.NodeJS:
                    if (_config.IsProgrammer)
                    {
                        if (false == Directory.Exists(Path.Combine(_selectedServer.ProjectPath, "dist")))
                        {
                            UpdatePatchState(true, "빌드 폴더를 생성해 주세요.");
                            return;
                        }
                    }
                    else
                    {
                        if (false == Directory.Exists(Path.Combine(_selectedServer.ProjectPath, "src")))
                        {
                            UpdatePatchState(true, "리소스 폴더를 생성해 주세요.");
                            return;
                        }
                    }

                    break;

                case ProjectType.DotNet:
                    break;
            }

            if (false == await ToggleServer(_selectedServer, false))
            {
                UpdatePatchState(true, "서버를 종료하지 못했습니다.");
                return;
            }

            PatchProgressBar.Value = 5;

            switch (CreateCompress())
            {
                case ErrorZip.NotFoundSourcePath:
                    UpdatePatchState(true, "압축할 빌드파일 경로를 찾을 수 없습니다.", 0);
                    return;

                default:
                    break;
            }
            PatchProgressBar.Value = 35;

            if (1 == Upload(_selectedServer))
            {
                UpdatePatchState(true, "파일을 업로드하지 못했습니다.", 0);
                if (File.Exists(_compressFilePath))
                    File.Delete(_compressFilePath);

                return;
            }

            if (File.Exists(_compressFilePath))
            {
                File.Delete(_compressFilePath);
            }

            PatchProgressBar.Value = 65;

            if (false == await UnzipBinary(_selectedServer))
            {
                UpdatePatchState(true, "서버에서 압축을 해제하지 못했습니다.", 0);
                return;
            }
            PatchProgressBar.Value = 95;

            if (false == await ToggleServer(_selectedServer, true))
            {
                UpdatePatchState(true, "서버를 시작하지 못했습니다.", 0);
                return;
            }
            UpdatePatchState(true, "완료되었습니다.", 100);
        }

        private void PatchButton_Click(object sender, EventArgs e)
        {
            //ToDo : 패치 체크(패치가능할때인가)
            var strPatchServers = $"{_selectedServer.Name} 서버를 패치합니다.{Environment.NewLine}";
            strPatchServers += "진행하시겠습니까?";

            if (MessageBox.Show(strPatchServers, "경고", MessageBoxButtons.YesNo) == DialogResult.Yes)
                PatchServer();
        }

        private async void StartServerButton_Click(object sender, EventArgs e)
        {
            if (false == CheckSelectedServer())
                return;

            var strPatchServers = $"{_selectedServer.Name} 서버를 시작 합니다.{Environment.NewLine}";
            strPatchServers += "진행하시겠습니까?";

            if (MessageBox.Show(strPatchServers, "경고", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                if (false == await ToggleServer(_selectedServer, true))
                {
                    SetButton(true);
                    MessageBox.Show("서버를 시작하지 못했습니다.");
                    return;
                }
            }
        }

        private async void StopServerButton_Click(object sender, EventArgs e)
        {
            if (false == CheckSelectedServer())
                return;

            var strPatchServers = $"{_selectedServer.Name} 서버를 종료 합니다.{Environment.NewLine}";
            strPatchServers += "진행하시겠습니까?";

            if (MessageBox.Show(strPatchServers, "경고", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                if (false == await ToggleServer(_selectedServer, false))
                {
                    SetButton(true);
                    MessageBox.Show("서버를 종료하지 못했습니다.");
                    return;
                }
            }
        }

        private async void InstallNPMPackageButton_Click(object sender, EventArgs e)
        {
            if (false == CheckSelectedServer())
                return;

            var strPatchServers = $"{_selectedServer.Name} 패키지를 설치 합니다.{Environment.NewLine}";
            strPatchServers += "진행하시겠습니까?";

            if (MessageBox.Show(strPatchServers, "경고", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                SetButton(false);

                if (await InstallNPMPackge(_selectedServer))
                {
                    MessageBox.Show("패키지를 설치를 완료했습니다.");
                }
                else
                {
                    MessageBox.Show("패키지를 설치하지 못했습니다.");
                }

                SetButton(true);
            }
        }

        private async Task<bool> CallSupervisor(ClientReq type, ServerData server)
        {
            if (null == server || string.IsNullOrWhiteSpace(server.Host))
                return false;

            TcpClient client = new TcpClient();
            try
            {
                client.Connect(server.Host, server.Port);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
                _logger.LogError(ex.Message, ex);
                return false;
            }

            var includeFolders = new List<IncludeFolder>();

            if (_config.IsProgrammer)
            {
                for (var i = 0; i < IncludeFolderCheckedListBox.Items.Count; i++)
                {
                    try
                    {
                        if (IncludeFolderCheckedListBox.GetItemChecked(i))
                            includeFolders.Add((IncludeFolder)i);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex.Message);
                    }
                }
            }
            else
            {
                var enums = Enum.GetNames(typeof(IncludeFolder));
                for (var i = 0; i < enums.Length; i++)
                    includeFolders.Add((IncludeFolder)i);
            }

            PacketData req = new PacketData
            {
                Type = (int)type,
                ServerName = server.Name,
                ServiceName = server.ServiceName,
                ExcuteFileName = server.ExcuteFileName,
                ServiceType = server.ServiceType,
                ProjectType = server.ProjectType,
                includeFolders = includeFolders,
                Data = "",
                CoreVersion = server.CoreVersion
            };

            NetworkStream networkStream = null;

            try
            {
                networkStream = client.GetStream();
                networkStream.ReadTimeout = 1;
            }
            catch (IOException ex)
            {
                MessageBox.Show(ex.Message);
                _logger.LogError(ex.Message, ex);
                SetButton(true);
                return false;
            }

            StreamWriter streamWriter = new StreamWriter(networkStream);
            await streamWriter.WriteLineAsync(JsonConvert.SerializeObject(req));
            streamWriter.Flush();

            StreamReader streamReader = new StreamReader(networkStream);

            var packetString = await streamReader.ReadToEndAsync();
            if (false == string.IsNullOrWhiteSpace(packetString))
            {
                var ackData = JsonConvert.DeserializeObject<PacketData>(packetString);
            }
            networkStream.Close();
            return true;
        }

        private async Task<bool> ToggleServer(ServerData server, bool on)
        {
            return await CallSupervisor(on ? ClientReq.StartServer : ClientReq.StopServer, server);
        }

        private async Task<bool> UnzipBinary(ServerData server)
        {
            return await CallSupervisor(ClientReq.Unzip, server);
        }

        private async Task<bool> InstallNPMPackge(ServerData server)
        {
            return await CallSupervisor(ClientReq.InstallNPMPackage, server);
        }

        private async Task<bool> TestReq(ServerData server)
        {
            return await CallSupervisor(ClientReq.Test, server);
        }

        private int Upload(ServerData server)
        {
            if (null == server || string.IsNullOrWhiteSpace(server.UploadPath))
            {
                _logger.LogError("Error: Undefined upload path.");
                return 1;
            }

            if (string.IsNullOrWhiteSpace(server.Host))
            {
                _logger.LogError("Error: Undefined ftp host.");
                return 1;
            }

            if (1 > server.FTPPort)
            {
                _logger.LogError("Error: Undefined ftp port.");
                return 1;
            }

            try
            {
                new NetworkCredential();
                FtpClient client = new FtpClient(server.Host, server.User, server.Pass, server.FTPPort);
                client.Connect();
                var uploadPath = Path.Combine(server.UploadPath, _selectedServer.Name + ".zip");
                var result = client.UploadFile($@"{_compressFilePath}", uploadPath, FtpRemoteExists.Overwrite, true, FtpVerify.Retry); ;
                _logger.LogInformation($"result: {result}");
                client.Disconnect();
                return 0;
            }
            catch (Exception e)
            {
                _logger.LogError("Error: {0}", e);
                return 1;
            }
        }

        protected string ServerHttpGet(string callUrl)
        {
            HttpWebRequest httpWebRequest = (HttpWebRequest)WebRequest.Create(callUrl);
            // 인코딩 UTF-8

            httpWebRequest.ContentType = "application/x-www-form-urlencoded; charset=UTF-8";
            httpWebRequest.Method = "GET";
            HttpWebResponse httpWebResponse = (HttpWebResponse)httpWebRequest.GetResponse();
            StreamReader streamReader = new StreamReader(httpWebResponse.GetResponseStream(), Encoding.GetEncoding("UTF-8"));
            string ret = streamReader.ReadToEnd();

            streamReader.Close();
            httpWebResponse.Close();

            return ret;
        }

        private void ServerListComboBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            var selectedIndex = ServerListComboBox.SelectedIndex;
            SelectServer(selectedIndex);
        }

        private bool SelectServer(int index)
        {
            if (index >= _config.ServerList.Count)
            {
                MessageBox.Show($"{index + 1}번째 서버는 없습니다.");
                _logger.LogError($"No exists the server data.");
                return false;
            }

            ServerData selectedServer = null;
            try
            {
                selectedServer = _config.ServerList[index];
            }
            catch (Exception ex)
            {
                _logger.LogError($"select server : {ex.Message}");
            }

            if (null == selectedServer)
            {
                _logger.LogError($"Can not found the server data.");
                return false;
            }
            _selectedServer = selectedServer;
            _compressFilePath = Path.Combine(AppContext.BaseDirectory, _selectedServer.Name + ".zip");
            ProjectPathTextBox.Text = _selectedServer.ProjectPath;
            UpdateIncludeFolderSelector();
            switch (_selectedServer.ProjectType)
            {
                case ProjectType.NodeJS:
                    InstallNPMPackageButton.Enabled = true;
                    break;

                default:
                    InstallNPMPackageButton.Enabled = false;
                    break;
            }
            return true;
        }

        private void PatchProgressBar_Click(object sender, EventArgs e)
        {

        }

        private void SetButton(bool isOn)
        {
            if (false == isOn)
                PatchProgressBar.Focus();

            IncludeFolderCheckedListBox.Enabled = isOn;
            ProjectPathTextBox.Enabled = isOn;
            ServerListComboBox.Enabled = isOn;
            PatchButton.Enabled = isOn;
            StartServerButton.Enabled = isOn;
            StopServerButton.Enabled = isOn;
            switch (_selectedServer.ProjectType)
            {
                case ProjectType.NodeJS:
                    InstallNPMPackageButton.Enabled = isOn;
                    break;

                default:
                    InstallNPMPackageButton.Enabled = false;
                    break;
            }
            if (isOn)
                PatchProgressBar.Value = 0;
        }

        private void CreateDirectory(string directoryName)
        {
            if (false == Directory.Exists($"{ProjectPathTextBox.Text}/{directoryName}"))
            {
                Directory.CreateDirectory($"{ProjectPathTextBox.Text}/{directoryName}");
            }
        }

        private bool GetIgnoreFoldersFromBuild(string fileName)
        {
            var ignore = false;
            var filesRegex = new Regex(@"(\\|/)wwwroot(\\|/)files(\\|/)", RegexOptions.IgnoreCase);
            var cssRegex = new Regex(@"(\\|/)wwwroot(\\|/)css(\\|/)", RegexOptions.IgnoreCase);
            var imagesRegex = new Regex(@"(\\|/)wwwroot(\\|/)images(\\|/)", RegexOptions.IgnoreCase);
            var videosRegex = new Regex(@"(\\|/)wwwroot(\\|/)videos(\\|/)", RegexOptions.IgnoreCase);
            var audiosRegex = new Regex(@"(\\|/)wwwroot(\\|/)audios(\\|/)", RegexOptions.IgnoreCase);
            var fontsRegex = new Regex(@"(\\|/)wwwroot(\\|/)fonts(\\|/)", RegexOptions.IgnoreCase);
            if (ProjectType.NodeJS == _selectedServer.ProjectType)
            {
                imagesRegex = new Regex(@"(\\|/)public(\\|/)images(\\|/)", RegexOptions.IgnoreCase);
                videosRegex = new Regex(@"(\\|/)public(\\|/)videos(\\|/)", RegexOptions.IgnoreCase);
                audiosRegex = new Regex(@"(\\|/)public(\\|/)audios(\\|/)", RegexOptions.IgnoreCase);
                fontsRegex = new Regex(@"(\\|/)public(\\|/)fonts(\\|/)", RegexOptions.IgnoreCase);
            }
            var jsRegex = new Regex(@"(\\|/)wwwroot(\\|/)js(\\|/)", RegexOptions.IgnoreCase);
            var libRegex = new Regex(@"(\\|/)wwwroot(\\|/)lib(\\|/)", RegexOptions.IgnoreCase);
            var identityRegex = new Regex(@"(\\|/)wwwroot(\\|/)Identity(\\|/)", RegexOptions.IgnoreCase);
            var jsonConfigRegex = new Regex(@"(\\|/)(?!(navmenu|jwt))([a-z])+(settings)([a-z\.])*\.json", RegexOptions.IgnoreCase);
            var navMenuSettingsRegex = new Regex(@"(\\|/)(navmenusettings)([a-z\.])*\.json", RegexOptions.IgnoreCase);
            var navMenuSettingsOnlyRegex = new Regex(@"(\\|/)(navmenusettings)\.json", RegexOptions.IgnoreCase);
            var jwtSettingsRegex = new Regex(@"(\\|/)(jwtsettings)([a-z\.])*\.json", RegexOptions.IgnoreCase);
            var jwtSettingsOnlyRegex = new Regex(@"(\\|/)(jwtsettings)\.json", RegexOptions.IgnoreCase);
            var webConfigRegex = new Regex(@"(\\|/)web\.config", RegexOptions.IgnoreCase);
            var envRegex = new Regex(@"(\\|/)\.env", RegexOptions.IgnoreCase);
            var tsconfigRegex = new Regex(@"(\\|/)tsconfig\.server\.tsbuildinfo", RegexOptions.IgnoreCase);

            if (ProjectType.DotNet == _selectedServer.ProjectType)
            {
                ignore = filesRegex.IsMatch(fileName)
                    || identityRegex.IsMatch(fileName)
                    || jsonConfigRegex.IsMatch(fileName)
                    || webConfigRegex.IsMatch(fileName);
            }

            if (ProjectType.NodeJS == _selectedServer.ProjectType)
            {
                ignore = envRegex.IsMatch(fileName)
                    || tsconfigRegex.IsMatch(fileName);
            }

            if (false == ignore)
            {
                if (ProjectType.DotNet == _selectedServer.ProjectType)
                {
                    for (var i = 0; i < IncludeFolderCheckedListBox.Items.Count; i++)
                    {
                        if (ignore)
                            continue;

                        try
                        {
                            if (IncludeFolderCheckedListBox.GetItemChecked(i))
                                continue;

                            switch ((IncludeFolder)i)
                            {
                                case IncludeFolder.css:
                                    ignore = cssRegex.IsMatch(fileName);
                                    break;

                                case IncludeFolder.js:
                                    ignore = jsRegex.IsMatch(fileName);
                                    break;

                                case IncludeFolder.images:
                                    ignore = imagesRegex.IsMatch(fileName);
                                    break;

                                case IncludeFolder.lib:
                                    ignore = libRegex.IsMatch(fileName);
                                    break;

                                case IncludeFolder.navmenusettings:
                                    ignore = navMenuSettingsOnlyRegex.IsMatch(fileName);
                                    break;

                                case IncludeFolder.jwtsettings:
                                    ignore = jwtSettingsOnlyRegex.IsMatch(fileName);
                                    break;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex.Message);
                        }
                    }
                }
                else if (ProjectType.NodeJS == _selectedServer.ProjectType)
                {
                    ignore = imagesRegex.IsMatch(fileName) || videosRegex.IsMatch(fileName) || audiosRegex.IsMatch(fileName) || fontsRegex.IsMatch(fileName);
                }
            }

            return false == ignore;
        }

        private bool GetOnlyIncludeFoldersFromSourceCode(string fileName)
        {
            var include = false;

            switch (_selectedServer.ProjectType)
            {
                case ProjectType.DotNet:
                    break;

                case ProjectType.NodeJS:
                    var distRegex = new Regex(@"(\\|/)dist(\\|/).*$", RegexOptions.IgnoreCase);
                    var scriptsRegex = new Regex(@"(\\|/)ngel(\\|/)scripts(\\|/).*\.json$", RegexOptions.IgnoreCase);
                    var imagesRegex = new Regex(@"(\\|/)public(\\|/)images(\\|/).*$", RegexOptions.IgnoreCase);
                    var videosRegex = new Regex(@"(\\|/)public(\\|/)videos(\\|/).*$", RegexOptions.IgnoreCase);
                    var audiosRegex = new Regex(@"(\\|/)public(\\|/)audios(\\|/).*$", RegexOptions.IgnoreCase);
                    var fontsRegex = new Regex(@"(\\|/)public(\\|/)fonts(\\|/).*$", RegexOptions.IgnoreCase);
                    if (_config.IsProgrammer)
                    {
                        if (0 < IncludeFolderCheckedListBox.CheckedItems.Count)
                        {
                            foreach (var item in IncludeFolderCheckedListBox.CheckedItems)
                            {
                                // build된 배포소스 폴더는 제외한다
                                if (distRegex.IsMatch(fileName))
                                    continue;

                                if (include)
                                    continue;

                                switch (item.ToString())
                                {
                                    case "scripts":
                                        include = scriptsRegex.IsMatch(fileName);
                                        break;

                                    case "images":
                                        include = imagesRegex.IsMatch(fileName);
                                        break;

                                    case "videos":
                                        include = videosRegex.IsMatch(fileName);
                                        break;

                                    case "audios":
                                        include = audiosRegex.IsMatch(fileName);
                                        break;

                                    case "fonts":
                                        include = fontsRegex.IsMatch(fileName);
                                        break;
                                }
                            }
                        }
                    }
                    else
                    {
                        include = scriptsRegex.IsMatch(fileName) || imagesRegex.IsMatch(fileName) || videosRegex.IsMatch(fileName) || audiosRegex.IsMatch(fileName) || fontsRegex.IsMatch(fileName);
                    }
                    break;
            }

            return include;
        }

        private bool GetOnlyIncludeScripts(string fileName)
        {
            var include = false;

            var moduleRegex = new Regex(@"(\\|/)node_modules(\\|/).*$", RegexOptions.IgnoreCase);
            var publicRegex = new Regex(@"(\\|/)public(\\|/).*$", RegexOptions.IgnoreCase);
            var distRegex = new Regex(@"(\\|/)dist(\\|/).*$", RegexOptions.IgnoreCase);
            var scriptRegex = new Regex(@"(\\|/)ngel(\\|/)scripts(\\|/).*\.json$", RegexOptions.IgnoreCase);
            include = scriptRegex.IsMatch(fileName) && false == distRegex.IsMatch(fileName) && false == moduleRegex.IsMatch(fileName) && false == publicRegex.IsMatch(fileName);

            return include;
        }

        private bool GetOnlyIncludeImages(string fileName)
        {
            var include = false;

            var moduleRegex = new Regex(@"(\\|/)node_modules(\\|/).*$", RegexOptions.IgnoreCase);
            var srcRegex = new Regex(@"(\\|/)src(\\|/).*$", RegexOptions.IgnoreCase);
            var distRegex = new Regex(@"(\\|/)dist(\\|/).*$", RegexOptions.IgnoreCase);
            var imageRegex = new Regex(@"(\\|/)public(\\|/)images(\\|/).*$", RegexOptions.IgnoreCase);
            include = imageRegex.IsMatch(fileName) && false == distRegex.IsMatch(fileName) && false == moduleRegex.IsMatch(fileName) && false == srcRegex.IsMatch(fileName);

            return include;
        }

        private bool GetOnlyIncludeVideos(string fileName)
        {
            var include = false;

            var moduleRegex = new Regex(@"(\\|/)node_modules(\\|/).*$", RegexOptions.IgnoreCase);
            var srcRegex = new Regex(@"(\\|/)src(\\|/).*$", RegexOptions.IgnoreCase);
            var distRegex = new Regex(@"(\\|/)dist(\\|/).*$", RegexOptions.IgnoreCase);
            var videoRegex = new Regex(@"(\\|/)public(\\|/)videos(\\|/).*$", RegexOptions.IgnoreCase);
            include = videoRegex.IsMatch(fileName) && false == distRegex.IsMatch(fileName) && false == moduleRegex.IsMatch(fileName) && false == srcRegex.IsMatch(fileName);

            return include;
        }

        private bool GetOnlyIncludeAudios(string fileName)
        {
            var include = false;

            var moduleRegex = new Regex(@"(\\|/)node_modules(\\|/).*$", RegexOptions.IgnoreCase);
            var srcRegex = new Regex(@"(\\|/)src(\\|/).*$", RegexOptions.IgnoreCase);
            var distRegex = new Regex(@"(\\|/)dist(\\|/).*$", RegexOptions.IgnoreCase);
            var audioRegex = new Regex(@"(\\|/)public(\\|/)audios(\\|/).*$", RegexOptions.IgnoreCase);
            include = audioRegex.IsMatch(fileName) && false == distRegex.IsMatch(fileName) && false == moduleRegex.IsMatch(fileName) && false == srcRegex.IsMatch(fileName);

            return include;
        }

        private bool GetOnlyIncludeFonts(string fileName)
        {
            var include = false;

            var moduleRegex = new Regex(@"(\\|/)node_modules(\\|/).*$", RegexOptions.IgnoreCase);
            var srcRegex = new Regex(@"(\\|/)src(\\|/).*$", RegexOptions.IgnoreCase);
            var distRegex = new Regex(@"(\\|/)dist(\\|/).*$", RegexOptions.IgnoreCase);
            var fontRegex = new Regex(@"(\\|/)public(\\|/)fonts(\\|/).*$", RegexOptions.IgnoreCase);
            include = fontRegex.IsMatch(fileName) && false == distRegex.IsMatch(fileName) && false == moduleRegex.IsMatch(fileName) && false == srcRegex.IsMatch(fileName);

            return include;
        }

        private ErrorZip CreateCompress()
        {
            if (File.Exists(_compressFilePath))
            { 
                File.Delete(_compressFilePath);
            }

            var source = _selectedServer.ProjectPath;
            switch (_selectedServer.ProjectType)
            {
                case ProjectType.DotNet:
                    source = Path.Combine(_selectedServer.ProjectPath, "bin", "Release", $"net{_selectedServer.LanguageVersion.ToString("#.0")}", "publish");
                    if (false == Directory.Exists(source))
                    {
                        return ErrorZip.NotFoundSourcePath;
                    }

                    _zipHelper.CreateFromDirectory(source, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetIgnoreFoldersFromBuild(file));
                    break;

                case ProjectType.NodeJS:
                    if (_config.IsProgrammer)
                    {
                        if (0 < IncludeFolderCheckedListBox.CheckedItems.Count)
                        {
                            foreach (var item in IncludeFolderCheckedListBox.CheckedItems)
                            {
                                switch (item.ToString())
                                {
                                    case "scripts":
                                        source = Path.Combine(_selectedServer.ProjectPath, "src");
                                        if (false == Directory.Exists(source))
                                        {
                                            return ErrorZip.NotFoundSourcePath;
                                        }
                                        _zipHelper.CreateFromDirectoryOnly(source, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetOnlyIncludeScripts(file), FileMode.OpenOrCreate, ZipArchiveMode.Update);
                                        break;

                                    case "images":
                                        if (false == Directory.Exists(_selectedServer.ProjectPath))
                                        {
                                            return ErrorZip.NotFoundSourcePath;
                                        }
                                        _zipHelper.CreateFromDirectoryOnly(_selectedServer.ProjectPath, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetOnlyIncludeImages(file), FileMode.OpenOrCreate, ZipArchiveMode.Update);
                                        break;

                                    case "videos":
                                        if (false == Directory.Exists(_selectedServer.ProjectPath))
                                        {
                                            return ErrorZip.NotFoundSourcePath;
                                        }
                                        _zipHelper.CreateFromDirectoryOnly(_selectedServer.ProjectPath, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetOnlyIncludeVideos(file), FileMode.OpenOrCreate, ZipArchiveMode.Update);
                                        break;

                                    case "audios":
                                        if (false == Directory.Exists(_selectedServer.ProjectPath))
                                        {
                                            return ErrorZip.NotFoundSourcePath;
                                        }
                                        _zipHelper.CreateFromDirectoryOnly(_selectedServer.ProjectPath, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetOnlyIncludeAudios(file), FileMode.OpenOrCreate, ZipArchiveMode.Update);
                                        break;

                                    case "fonts":
                                        if (false == Directory.Exists(_selectedServer.ProjectPath))
                                        {
                                            return ErrorZip.NotFoundSourcePath;
                                        }
                                        _zipHelper.CreateFromDirectoryOnly(_selectedServer.ProjectPath, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetOnlyIncludeFonts(file), FileMode.OpenOrCreate, ZipArchiveMode.Update);
                                        break;
                                }
                            }
                        }
                        else
                        {
                            source = Path.Combine(_selectedServer.ProjectPath, "dist");
                            if (false == Directory.Exists(source))
                            {
                                return ErrorZip.NotFoundSourcePath;
                            }
                            _zipHelper.CreateFromDirectory(source, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetIgnoreFoldersFromBuild(file));
                        }
                    }
                    else
                    {
                        source = Path.Combine(_selectedServer.ProjectPath, "src");
                        if (false == Directory.Exists(source))
                        {
                            return ErrorZip.NotFoundSourcePath;
                        }
                        _zipHelper.CreateFromDirectoryOnly(source, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetOnlyIncludeFoldersFromSourceCode(file));
                        _zipHelper.CreateFromDirectoryOnly(_selectedServer.ProjectPath, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetOnlyIncludeImages(file), FileMode.OpenOrCreate, ZipArchiveMode.Update);
                        _zipHelper.CreateFromDirectoryOnly(_selectedServer.ProjectPath, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetOnlyIncludeVideos(file), FileMode.OpenOrCreate, ZipArchiveMode.Update);
                        _zipHelper.CreateFromDirectoryOnly(_selectedServer.ProjectPath, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetOnlyIncludeAudios(file), FileMode.OpenOrCreate, ZipArchiveMode.Update);
                        _zipHelper.CreateFromDirectoryOnly(_selectedServer.ProjectPath, _compressFilePath, CompressionLevel.Optimal, false, (file) => GetOnlyIncludeFonts(file), FileMode.OpenOrCreate, ZipArchiveMode.Update);
                    }

                    break;
            }

            return ErrorZip.None;
        }

        private void ShortCut(object sender, KeyEventArgs e)
        {
            if (e.Control && Keys.W == e.KeyCode)
            {
                this.Close();
            }
            else if (e.Control && Keys.F == e.KeyCode)
            {
                this.PatchServer();
            }
            else if (e.Control && Keys.D1 == e.KeyCode)
            {
                var index = 0;
                if (SelectServer(index))
                    ServerListComboBox.SelectedIndex = index;
            }
            else if (e.Control && Keys.D2 == e.KeyCode)
            {
                var index = 1;
                if (SelectServer(index))
                    ServerListComboBox.SelectedIndex = index;
            }
            else if (e.Control && Keys.D3 == e.KeyCode)
            {
                var index = 2;
                if (SelectServer(index))
                    ServerListComboBox.SelectedIndex = index;
            }
            else if (e.Control && Keys.D4 == e.KeyCode)
            {
                var index = 3;
                if (SelectServer(index))
                    ServerListComboBox.SelectedIndex = index;
            }
            else if (e.Control && Keys.D5 == e.KeyCode)
            {
                var index = 4;
                if (SelectServer(index))
                    ServerListComboBox.SelectedIndex = index;
            }
        }

        private void UpdateIncludeFolderSelector()
        {
            IncludeFolderCheckedListBox.Items.Clear();

            if (_config.IsProgrammer)
            {
                switch (_selectedServer.ProjectType)
                {
                    case ProjectType.DotNet:
                        foreach (var incFile in Enum.GetNames(typeof(IncludeFolder)))
                            IncludeFolderCheckedListBox.Items.Add(incFile);
                        break;

                    case ProjectType.NodeJS:
                        IncludeFolderCheckedListBox.Items.Add(IncludeFolder.scripts);
                        IncludeFolderCheckedListBox.Items.Add(IncludeFolder.images);
                        IncludeFolderCheckedListBox.Items.Add(IncludeFolder.videos);
                        IncludeFolderCheckedListBox.Items.Add(IncludeFolder.audios);
                        IncludeFolderCheckedListBox.Items.Add(IncludeFolder.fonts);
                        break;
                }
            }
        }
    }
}
