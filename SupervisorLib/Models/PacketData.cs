using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Supervisor.Models
{
    public class PacketData
    {
        public int Type { get; set; }
        public string ServerName { get; set; }
        private string _serviceName;
        public string ServiceName
        {
            get { return string.IsNullOrWhiteSpace(_serviceName) ? ServerName : _serviceName; }
            set { _serviceName = value; }
        }
        private string _excuteFileName;
        public string ExcuteFileName
        {
            get { return string.IsNullOrWhiteSpace(_excuteFileName) ? ServerName : _excuteFileName; }
            set { _excuteFileName = value; }
        }
        public ServiceType ServiceType { get; set; }
        public ProjectType ProjectType { get; set; }
        public List<IncludeFolder> includeFolders { get; set; } = new List<IncludeFolder>();
        public string Data { get; set; }
        public string CoreVersion { get; set; }
    }
}
