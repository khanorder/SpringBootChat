using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Supervisor.Models;

namespace Supervisor.Client.Models
{
    [Serializable]
    public class Config
    {
        public bool IsProgrammer { get; set; }
        public List<ServerData> ServerList { get; set; }
    }
}
