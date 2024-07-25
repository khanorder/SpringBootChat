using Supervisor.Models;
using System;

namespace Supervisor.Server.Models
{
    [Serializable]
    public class Config
    {
        public ServerOS ServerOS { get; set; } = ServerOS.Linux;
        public int ServerPort { get; set; } = 5659;
        public string BasePath { get; set; } = "";
    }
}
