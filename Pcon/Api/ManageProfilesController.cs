using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Neo4jClient.Transactions;
using Pcon.DAL;

namespace Pcon.Api
{
    public class ManageProfilesController : ApiController
    {
        private readonly SkillRepository _skillRepository;

        public ManageProfilesController()
        {
            var graphClient = WebApiConfig.GraphClient;
            _skillRepository = new SkillRepository(graphClient);
        }

        public ManageProfilesController(ITransactionalGraphClient graphClient)
        {
            _skillRepository = new SkillRepository(graphClient);
        }

        public IHttpActionResult Get()
        {
            var profiles = _skillRepository.AllProfiles();
            return Ok(profiles);
        }
    }
}
