# App Routes

module.exports = (app) ->
  app.get "/api/v1/foo", (req, res) ->
    res.json([{ name: 'larry' }, { name: 'curly' }, { name: 'moe' }]);  
