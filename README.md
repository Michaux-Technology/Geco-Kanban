<p align="center">
<img src="https://github.com/user-attachments/assets/bc12afbd-acd1-4e97-b061-561dbe88599a" alt="Kanri banner" />
</p>

# The Ultimate Project Management Software – Kanban, Gantt & Real-Time Collaboration

## ➤ Description

<h3>Boost Productivity with an Intuitive Project Management Tool</h3>

Our cutting-edge project management software empowers teams to organize, track, and collaborate seamlessly using Kanban boards and Gantt charts. Effortlessly drag and drop tasks, assign them to team members, add comments, and keep everyone aligned in real-time.

Key Features for Maximum Efficiency:

✅ Drag-and-Drop Task Management – Move tasks between columns with ease and visualize your workflow dynamically.

✅ Task Assignment & Tracking – Instantly see who is responsible for what.

✅ Real-Time Cost Calculation – Track project costs and resource allocation as you work.

✅ Real-Time Collaboration – Changes update live without page refresh.

✅ File Sharing – Keep teams informed by attaching relevant documents.

✅ Multi-User Access – Work together with full transparency and efficiency.


<h3>Seamless Communication with Built-in Video Conferencing</h3>
Collaboration is key to success! That's why our platform includes an integrated video conferencing module, ensuring smooth communication between project partners, no matter where they are.

<h3>Why Choose Our Project Management Software?</h3>

📊 Powerful Project Tracking – Stay on top of deadlines with Gantt charts.

🎯 Visual Task Management – Easily move and organize tasks with an intuitive drag-and-drop interface.

🔄 100% Real-Time Updates – No more delays or miscommunication.

💰 Smart Budgeting – Get instant cost calculations to optimize resource usage.

💡 Start managing your projects smarter today!

## ➤ Technologies used

HTML
React.js
Node.js
Express.js
Mongodb

## ➤ Rights

The license available on Github is : 

[CC BY-NC-ND 4.0 DEED](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.en)

## ➤ Origin of the project
This project was created by a 🇫🇷 living in 🇩🇪.   

This project is totally 🇪🇺. 

by <b>Valéry-Jérôme Michaux</b>

## ➤ Project status

1. New features v 5.23 :
- Compatible HTTPS

2. Upcoming features :
- bug fixes

## ➤ Questions / Answers

Ask your questions, let us know about bugs...
[Click here](https://github.com/Michaux-Technology/Geco-Kanban/discussions)

## ➤ Setup

1. Install your Mongodb server and create your collection with a name such as "Kanban". 

2. Install Node.js and npm.

3. Configure your backend so that it can read this collection under : 

   /backend/config.js

4. Then configure your React.js frontend so that it can read your backend server: 

   /frontend/config.jsx

5. install the project in the command prompt :

   npm install

6. Launch the backend under ./backend/src : 

   node serverSoft.js

   and for the video conference:
   
   node serverVisio.js
   if you do not need it do not lauch it.

8. Run the frontend under ./frontend : 

   npm start

9. Configuring SSL Certificates

Prerequisites
- Install mkcert on your system

  For Windows with chocolatey
  choco install mkcert


Certificate generation

1. 1. Create a `certificates` folder at the root of the project:

   mkdir certificates
   cd certificates


2. Install the local certification authority :
   
   mkcert -install


4. Generate certificates for local development:

   mkcert -cert-file certificate.crt -key-file private.key localhost 127.0.0.1 192.168.1.101


Certificate structure
Certificates will be used by :
- The frontend (port 3000)
- Main backend (port 3001)
- Video conferencing server (port 3002)

Configuration
Certificates are automatically configured for :
- Frontend: via `.env` file
- Backend: via `serverSoft.js` and `serverVisio.js`.

Important notes
- These certificates are for local development only
- For production, use valid certificates from a recognized certification authority
- Generated certificates are valid for localhost, 127.0.0.1 and 192.168.1.101
- If you use another IP address, regenerate the certificates to include it

Troubleshooting
- If you see a "NET::ERR_CERT_AUTHORITY_INVALID" error, install the CA again with `mkcert -install`.
- If you see an "ERR_SSL_PROTOCOL_ERROR" error, check that the certificate paths are correct in your configuration files

## ➤ Make a donation

To obtain a license :
- [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/deed.en)
- [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode.en)
  
make the [right](https://github.com/sponsors/Michaux-Technology) donation

🙏🙏🙏

Good luck!

## ➤ Our video

https://www.youtube.com/watch?v=dMaUxjK4si4


## ➤ Our Screenshot

<b> Login screen </b>

![Image](https://github.com/user-attachments/assets/20821410-f658-499e-b6ef-b4b443980a91)

<b> Project list screen in card format.</b>
Here you can see the status of the project, its completion date and the people assigned to it. (Soon it will be possible to consult the files assigned to a project).

![Image](https://github.com/user-attachments/assets/78dd2011-0d5d-446e-ad61-807940ab96c5)

<b> File upload </b>
Insert files essential to your project

![Image](https://github.com/user-attachments/assets/2e59a43e-bc33-4638-8d06-9b02429b28db)


<b> User list </b> with Avatar.

![Capture d'écran 2024-12-08 162211](https://github.com/user-attachments/assets/40335590-c3a3-4e34-a8e8-ea45d1c7f52f)

<b> Kanban-based list of project tasks. </b>
You can add, drop and customize columns, drag and drop tasks, view the people assigned to them, check progress, start and end dates, like and comment...

![Image](https://github.com/user-attachments/assets/79c70251-5cb5-44a8-a7ec-cac5a4061157)

<b> View tasks assigned to the user </b>
See the tasks assigned to you and move them according to your work organization.

![Image](https://github.com/user-attachments/assets/55bd859b-0840-4f8d-ae2e-39bc5f9c3dc4)

<b> Gantt chart.</b> 
You can see dependencies, task names, progress and dates, and each task has the same color as in Kanban, making it easier to visualize.

![Image](https://github.com/user-attachments/assets/ff497da1-f3a1-476f-9d53-0339d905e2f5)

<b> Project cost management </b>
Track project costs in real time.

![Image](https://github.com/user-attachments/assets/967db9e8-07e9-4564-85d1-2dc0ddcadd79)

<b> video conferencing </b>
Videoconferencing with team members. 

![Image](https://github.com/user-attachments/assets/cecf7d81-50c7-4aaf-adc6-b887b056a3a2)

