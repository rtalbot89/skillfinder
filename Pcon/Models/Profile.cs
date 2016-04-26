using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Pcon.Models
{
    public class Profile
    {
        public string Name { get; set;}
        public string Organisation { get; set; }
        public ICollection<string> Skills { get; set; }
    }
}