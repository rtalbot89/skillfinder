using System;
using System.Configuration;
using System.Web.Http;
using System.Web.Http.Results;
using Neo4jClient;
using Neo4jClient.Transactions;
using NUnit.Framework;
using Pcon.Api;
using Pcon.DAL;

namespace Pcon.Tests.Api
{
    [TestFixture()]
    public class SkillSearchControllerTests
    {
        [SetUp]
        public void SetupTransactionContext()
        {
            // open the transaction, by default all future transactions will open and join this transaction.
            // This means that even if they call Commit(), the transaction will not be commited until this
            // transaction is the one that calls Commit(). However this will not happen in TearDown,
            // and therefore the whole changes are rollbacked.
            _graphClient.BeginTransaction();
        }

        [TearDown]
        public void EndTransactionContext()
        {
            // end the transaction as failure
            _graphClient.EndTransaction();
        }

        private SkillRepository _repository;
        private ITransactionalGraphClient _graphClient;

        [OneTimeSetUp]
        public void SetupTests()
        {
            var url = ConfigurationManager.AppSettings["GraphDBUrl"];
            var user = ConfigurationManager.AppSettings["GraphDBUser"];
            var password = ConfigurationManager.AppSettings["GraphDBPassword"];
            _graphClient = new GraphClient(new Uri(url), user, password);
            _graphClient.Connect();

            _repository = new SkillRepository(_graphClient);
        }

        [Test()]
        public void GetTest()
        {
           var controller = new SkillSearchController();
           var actionResult = controller.Get();
           var contentResult = actionResult as OkNegotiatedContentResult<object>;
           Assert.IsNotNull(contentResult);
        }

        [Test()]
        public void GetTest1()
        {
            Assert.Fail();
        }

        [Test()]
        public void PostTest()
        {
            Assert.Fail();
        }
    }
}