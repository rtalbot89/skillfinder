using System.Web.Mvc;

namespace Pcon.Controllers
{
    public class FindController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [Authorize]
        public ActionResult Create()
        {
            return View();
        }
    }
}