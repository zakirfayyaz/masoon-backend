# masoon

<!-- TO convert mongoDB-server from local to cloud, follow these steps -->
1. In 'app.js' on line-no-127, enter your ip-address
2. Go to, config/config.env, on line-no-5 paste following link in 'MONGO_URI'
    -> mongodb+srv://UzairAli:uzair40334@masoon.glkkg.mongodb.net/<dbname>?retryWrites=true&w=majority
    -> save the changes and restart server by typing commad 'npm start'

3. ALternate for step 2
    -> goto config/config.env
    -> Uncomment line 4 
    -> comment line 5
    -> restart the server by typing 'npm start'

