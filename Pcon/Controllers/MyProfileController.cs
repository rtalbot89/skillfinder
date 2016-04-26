using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Pcon.Controllers
{
    public class MyProfileController : Controller
    {
        // GET: MyProfile
        [Authorize]
        public ActionResult Index()
        {
            return View();
        }
    }
}