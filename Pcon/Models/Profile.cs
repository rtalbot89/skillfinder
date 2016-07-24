using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Pcon.Models
{
    public class Profile
    {
        public User User { get; set; }
        public ClientNode Ou { get; set; }
        public IEnumerable<ClientNode> Skills { get; set; }
    }
}