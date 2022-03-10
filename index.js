const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
const AxieModels = require('./axie');
const https = require('https');

const mongoose = require('mongoose');
const axie = require('./axie');
const typeDefs = importSchema('./schema.graphql');
mongoose.Promise = global.Promise;
// No env to enable visibility
mongoose.connect('mongodb+srv://admin:breederDAO-betest3722@breederdao-betest.7ijvh.mongodb.net/breederdao_betest')
    .then( () => console.log("connected to DB."))
    .catch( err => console.log(err));

const CLASSES = [
    'Beast',
    'Aquatic',
    'Plant',
    'Bird',
    'Bug',
    'Reptile',
    'Mech',
    'Dawn',
    'Dusk'
]
const resolvers = {
    Query: {},
    Mutation: {
        async syncAxies(_) {
            const db = mongoose.connection.db;
            const collections = await db.listCollections().toArray();
            collections
              .map((collection) => collection.name)
              .forEach(async (collectionName) => {
                db.dropCollection(collectionName);
              });
            for(let x = 0; x < 3; x++) {
                const data = JSON.stringify({
                    "operationName": "GetAxieLatest",
                    "variables": {
                      "from": x * 100,
                      "size": 100,
                      "sort": "Latest",
                      "auctionType": "Sale",
                      "criteria": {}
                    },
                    "query": "query GetAxieLatest(\n    $auctionType: AuctionType\n    $criteria: AxieSearchCriteria\n    $from: Int\n    $sort: SortBy\n    $size: Int\n    $owner: String\n  ) {\n    axies(\n      auctionType: $auctionType\n      criteria: $criteria\n      from: $from\n      sort: $sort\n      size: $size\n      owner: $owner\n    ) {\n      total\n      results {\n      ...AxieRowData\n      __typename\n      }\n      __typename\n    }\n  }\n  \n  fragment AxieRowData on Axie {\n    id\n    class\n    name\n    class\n    stage\n    auction {\n      ...AxieAuction\n      __typename\n    }\n    __typename\n  }\n  \n  fragment AxieAuction on Auction {\n    currentPriceUSD\n    __typename\n  }"
                });
            
                const options = {
                    hostname: 'graphql-gateway.axieinfinity.com',
                    path: '/graphql',
                    port: 443,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length
                    },
                };
                
                const req = await https.request(options, (res) => {
                    let data = '';
                    res.on('data', (d) => {
                        data += d;
                    });
                    res.on('end', () => {
                        const axies = JSON.parse(data).data.axies.results;
                        axies.map((axie) => AxieModels[axie.class].create({
                            ...axie,
                            price: axie.auction.currentPriceUSD || null
                        }));
                    });
                });
                
                req.on('error', (error) => {
                    return error;
                });
                await req.write(data);
                req.end();
            }
            
        }
    }
  };

CLASSES.forEach((CLASS) => {
    resolvers.Query[`${CLASS.toLowerCase()}s`] = () => await AxieModels[CLASS].find({});
});

  // The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(process.env.PORT || 5000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});