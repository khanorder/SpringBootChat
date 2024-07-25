using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Supervisor.Client.Models;
using System;
using System.IO;
using System.Collections.Generic;

namespace Supervisor.Client.Services
{
    public class ConfigService
    {
        private ILogger<ConfigService> _logger;
        private IHostEnvironment _hostEnvironment;
        private IConfiguration _configuration;
        private Config _config;
        private string _configPath;

        public ConfigService (ILogger<ConfigService> logger, IHostEnvironment hostEnvironment, Config config)
        {
            _logger = logger;
            _hostEnvironment = hostEnvironment;
            var configFile = "configsettings.json";
            if (_hostEnvironment.IsDevelopment())
                configFile = $"configsettings.{_hostEnvironment.EnvironmentName}.json";
            _config = config;
            _configPath = Path.Combine(AppContext.BaseDirectory, configFile);
        }

        private void CreateConfigFile()
        {
            if (false == File.Exists(_configPath))
            {
                try
                {
                    using (var configFile = File.Create(_configPath))
                    {
                        configFile.Close();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message);
                }
            }
        }

        public void SaveConfig()
        {
            CreateConfigFile();

            try
            {
                var appsettings = new Dictionary<string, object>();
                appsettings.Add("Config", _config);

                var appsettingsJsonData = JsonConvert.SerializeObject(appsettings, Formatting.Indented);
                File.WriteAllText(_configPath, appsettingsJsonData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
        }
        
    }
}
