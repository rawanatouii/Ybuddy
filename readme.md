**Ybuddy****, Online Coaching web app **
**FRONTEND : ****React**
**BACKEND : ****NestJs**
**DataBase**** : ****MariaDB**

**3 ****roles****:**** Admin, Coach, Client **
**Client****:**** **
**fill**** the ****form**** (****name****, ****age****, ****height****, ****weight****, Work, Health (options ****Diseases****), infections (options), Activity per ****day**** (options), Diet (****options:**** ****vegetarian****, ****vegan****, normal, ****junk**** ****food****, ****... )****, ****Workout**** ****frequency**** per ****week**** : 3,4,5 ****days**** **

**submit**** the ****form**** ****recieve**** ****message:**** Form sent to ****your**** future ****Coach!**** **

**Waiting**** ****response**** widget **

**Coach:**** ****recieves**** ****mail:**** New Client ****Recieves**** FORM infos in ****ClientX**** ****space**** **

**Clicks on ****Create**** Program **
**The ****exercises**** Catalogue Shows to ****complete**** the ****client's**** ****calendar**** **
**day**** 1 : ........ ****he**** has the option (Mark as ****rest**** ****day****)**
** the catalogue ****is**** ****filtered**** by Muscles' zone (****arms****, legs, ****glutes****, ****chest****, ****shoulders****, back...) and has a GIF for ****every**** ****exercise**** Precise ****Reps**** + rounds**

** ****when**** the program ****is**** ****ready****, click on Send to ****ClientX**** **
**save**** ****it**** in ****ClientX**** ****space**** **

**Client: ****Recieves**** a mail: ****Your**** program ****is**** ****ready**** **
**Consulting the program on the ****website**** **
**Admin: ****Creates**** the Catalogue by ****filling**** a ****form****: ****Exercise**** ****name**** Zone GIF**
**App Management: Total ****users****, Total Coachs, Total Clients, Total Programs (stats) **

**Optimize**** the UI/UX, ****it**** ****should**** look GOOD, user ****friendly**** and attractive (****beutiful****)**

**Relations :**
**  1**** Coach → ****many**** Clients**

**  1**** Client → 1 Program **

**  1**** Program → ****many**** ****days**

**  1**** jour → ****many**** ****exercises**

**Database**** : (ORM)**

**👤**** User**

- id

- email

- password

- role (ADMIN | COACH | CLIENT)

**🧑**** Client**

- id

- user_id

- name

- age

- height

- weight

- goal (prise de masse, sèche…)

- injuries (maladies/blessures)

- activity_level

**📝**** ****Request**** (formulaire)**

- id

- client_id

- coach_id

- status (pending, approved, rejected)

- created_at

**🏋️**** ****Exercise**

- id

- name

- muscle_group (back, chest, legs…)

- gif_url

**📅**** Program**

- id

- client_id

- coach_id

- start_date

- duration (ex: 4 weeks)

**📆**** Program_Day**

- id

- program_id

- day_number (day 1, 2…)

- type (workout / rest)

**💪**** ****Program_Exercise**

- id

- program_day_id

- exercise_id

- sets

- reps

 for coachs :
Chaque coach a :

👉 **un lien unique**

ybuddy.com/apply/{coachSlug}

Ex :

ybuddy.com/apply/jade-fit
ybuddy.com/apply/alex-coach

➡️ Quand le client clique :

- il arrive sur une page personnalisée

- le coach est **déjà identifié**

- il remplit le formulaire

**🧩**** 2. Modélisation (DB)**

Ajoute un champ dans **User (coach)** :

slug: string // ex: jade-fit

Optionnel mais propre :

publicProfileName: string // "Train with Jade"

Auth: the user connects, and chooses if he’s a coach or client, Admin should be initialized in the backend ( ex: username: superadmin, password: superpassword )

graphic chart: FinalProject\assets\Screenshot (172).png : get inspired by it