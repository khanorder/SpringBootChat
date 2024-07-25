using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Supervisor.Client.Models;
using Supervisor.Client.Services;
using System;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

namespace Supervisor.Client
{
    static class Program
    {
        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.SetHighDpiMode(HighDpiMode.SystemAware);
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            var host = CreateHostBuilder().Build();
            using (var serviceScope = host.Services.CreateScope())
            {
                var services = serviceScope.ServiceProvider;
                var configService = services.GetRequiredService<ConfigService>();
                var loggerFactory = services.GetRequiredService<ILoggerFactory>();
                
                var logger = loggerFactory.CreateLogger("Main");
                try
                {
                    var form = services.GetRequiredService<SupervisorClient>();
                    Application.Run(form);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex.Message);
                }
            }
        }

        public static IHostBuilder CreateHostBuilder()
        {
            var binaryPath = Assembly.GetEntryAssembly().Location;
            var contentRootPath = binaryPath.Substring(0, binaryPath.LastIndexOf(Path.DirectorySeparatorChar) + 1);
            var hostBuilder = Host.CreateDefaultBuilder()
                .UseContentRoot(contentRootPath)
                .ConfigureAppConfiguration((hostContext, config) => 
                {
                    var configFile = "configsettings.json";
                    if (hostContext.HostingEnvironment.IsDevelopment())
                        configFile = "configsettings.Development.json";
                    if (File.Exists(configFile))
                        config.AddJsonFile(configFile);
                })
                .ConfigureServices((hostContext, services) =>
                {
                    var config = hostContext.Configuration.GetSection("Config").Get<Config>();
                    services.AddScoped<SupervisorClient>();
                    services.AddSingleton<ConfigService>();
                    services.AddSingleton<Config>(config);
                    services.AddSingleton<ZipHelper>();
                })
                .ConfigureLogging((loggingBuilder) => {
                    loggingBuilder.AddFile(Path.Combine(contentRootPath, "Logs", "Log.txt"));
                });
            return hostBuilder;
        }
    }
}
