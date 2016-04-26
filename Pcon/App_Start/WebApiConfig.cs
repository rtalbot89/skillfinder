using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using Neo4jClient;
using System.Configuration;

namespace Pcon
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            //Use an IoC container and register as a Singleton
            var url = ConfigurationManager.AppSettings["GraphDBUrl"];
            var user = ConfigurationManager.AppSettings["GraphDBUser"];
            var password = ConfigurationManager.AppSettings["GraphDBPassword"];
            var client = new GraphClient(new Uri(url), user, password);
            client.Connect();

            GraphClient = client;
        }

        public static IGraphClient GraphClient { get; private set; }
    }
}
