using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Supervisor.Server.Services;
using System;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

namespace Supervisor.Server
{
    class Program
    {
        async static Task Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();
            var task = host.RunAsync();

            await task;
        }

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            var binaryPath = Assembly.GetEntryAssembly().Location;
            var contentRootPath = binaryPath.Substring(0, binaryPath.LastIndexOf(Path.DirectorySeparatorChar) + 1);
            var hostBuilder = Host.CreateDefaultBuilder(args)
                .UseWindowsService()
                .UseContentRoot(contentRootPath)
                .ConfigureHostConfiguration(builder => {
                    builder.AddCommandLine(args);
                })
                .ConfigureServices((hostContext, services) =>
                {
                    services.AddHostedService<SocketServer>();
                })
                .ConfigureLogging((loggingBuilder) => {
                    loggingBuilder.AddFile(Path.Combine(contentRootPath, "Logs", "Log.txt"));
                });
            return hostBuilder;
        }
    }
}
