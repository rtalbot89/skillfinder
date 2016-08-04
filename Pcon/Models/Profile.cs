using System.Collections.Generic;

namespace Pcon.Models
{
    public class Profile
    {
        public User User { get; set; }
        public ClientNode Ou { get; set; }
        public IEnumerable<ClientNode> Skills { get; set; }
    }
}