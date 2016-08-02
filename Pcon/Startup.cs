using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Pcon.Startup))]
namespace Pcon
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
        }
    }
}
