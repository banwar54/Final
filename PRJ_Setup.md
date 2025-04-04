<!-- Check nvm -->
 nvm -v
 
 <!-- if it shows error then do next step else skip it -->
 
 <!-- install nvm -->
 curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
 \. "$HOME/.nvm/nvm.sh"
 
 <!-- node installation -->
 nvm install 22
 
 <!-- set 22 as default -->
 nvm alias default 22.14.0
 
 <!-- npm install -->
 cd Frontend/
 npm install
 
 <!-- npm install -->
 cd Backend/
 npm install
 
 
 <!-- to run Project-->
 <!-- within both frontend and backend folder run following command-->
 npm run dev