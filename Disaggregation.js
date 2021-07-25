module.exports = function(RED) {
    function DisaggregationgNode(config) {
        RED.nodes.createNode(this,config);
        const axios = require("axios");
        var node = this;
        node.on('input', async function(msg) {
          const to = new Date().getTime();
          let from = node.context().get('from');
          if((typeof msg.payload !== 'undefined')&&(typeof msg.payload.from !== 'undefined')) from = msg.payload.from;
          if((typeof from == 'undefined')||(from == null)||(from < to - 7 * 86400000)) from = to - 7*86400000;
          const res = await axios.get('https://api.discovergy.com/public/v1/activities?meterId='+config.meterid+'&from='+from+'&to='+to, {
            auth: {
              username: node.credentials.username,
              password: node.credentials.password
            }
          });
          const data = res.data;
          for(let i=0;i<data.length;i++) {
            if(data[i].endTime > from) from = data[i].endTime;
            data[i].kwh = Math.round(data[i].energy / 10000000)/1000;
            data[i].minutes = Math.round((data[i].endTime-data[i].beginTime)/60000);
            msg.payload = data[i];
            node.send(msg);
          }
          node.context().set('from',from);
        });
    }
    RED.nodes.registerType("disaggregation",DisaggregationgNode,{
     credentials: {
         username: {type:"text"},
         password: {type:"password"}
     }
   });
}
