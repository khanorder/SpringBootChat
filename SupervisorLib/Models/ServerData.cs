using System;

namespace Supervisor.Models
{
    public class ServerData
    {
        public Guid Uid { get; set; } = Guid.NewGuid();
        public ServerOS OS { get; set; }
        public ServiceType ServiceType { get; set; }
        public ProjectType ProjectType { get; set; }
        public float LanguageVersion { get; set; } = 0.0F;
        private string _displayName;
        public string DisplayName
        {
            get { return string.IsNullOrWhiteSpace(_displayName) ? Name : _displayName; }
            set { _displayName = value; }
        }
        public string Name { get; set; }
        private string _serviceName;
        public string ServiceName
        {
            get { return string.IsNullOrWhiteSpace(_serviceName) ? Name : _serviceName; }
            set { _serviceName = value; }
        }
        private string _excuteFileName;
        public string ExcuteFileName
        {
            get { return string.IsNullOrWhiteSpace(_excuteFileName) ? Name : _excuteFileName; }
            set { _excuteFileName = value; }
        }
        public string Host { get; set; }
        public int Port { get; set; }
        public string User { get; set; }
        public string Pass { get; set; }
        public int SSHPort { get; set; }
        public string SshHostKeyFingerprint { get; set; }
        public int FTPPort { get; set; }
        public string UploadPath { get; set; }
        public string ProjectPath { get; set; }
        public string CoreVersion { get; set; }
    }
}
