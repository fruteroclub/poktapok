🤔 Discovery Questions
Application Flow & States
Q1: Application Review Process
Who reviews applications? (admins only, program leads, automated approval?)
Admins and moderators
What criteria determine approval/rejection?
Achievable goals that can be validated/verified, this will be a manual process where admins and moderators will review the applications and approve or reject them.
Should applicants know they're in "application pending" state, or should it feel like normal onboarding?
This process is tied to our Club Membership system, so we need to ensure that the application process is seamless and easy for the user. They will be able to use the platform as "Club Guest" until they are approved. This way they can appear in the directory and use the platform features for submissions, activities and bounties - as a guests - until they are approved.
Can users apply to multiple programs simultaneously, or must they choose one?
No, they must choose one. We also need to add a "Open" program for users to apply to if they are not sure which program to choose and/or they want to work on their own projects, as long as they can demonstrate progress and engagement in the platform.
Q2: Goal Commitment Details
Is the 1-month goal free-form text, or should we provide structured options?
Free-form text, users can write anything they want to achieve. We do require a project to be built to be accepted as member of the club. This can be an app, content creation, etc. Anything that demonstrates alignment with our ethos: GTFOL aka Get The Fuck Out Of Localhost ie shipping and putting our work in the hands of users.
Examples of goals: "Complete 10 activities", "Get first freelance client", "Deploy DeFi app"? Yes, but with a little more of information. A minimum of words is required, let's say 140 as if it was a tweet. Maximum of 280 characters.
Do goals need to be validated/approved by admins, or auto-accepted?
Goals are not validated/approved by admins, they are just a commitment from the user to themselves and the community. Admins and moderators will review the applications and approve or reject them.
Should goals be measurable/trackable, or just motivational statements?
Yes, they should be measurable and trackable. We will use the activities and submissions to track the progress of the user. We will probably need some base activities such as "New Feature", "Bug Fix", "Content Creation", "Deployment", "Marketing", "Community Engagement", "Research", "Event Participation", "Workshop Attendance", "Hackathon Participation", "Project Launch"
Program Structure
Q3: Program vs Activities Relationship
Are programs containers for activities (program has many activities)?
Yes, programs are containers for activities. They don't have to be, there can be standalone activities that are not part of a program.
Can activities belong to multiple programs?
Yes, activities can belong to multiple programs. The base activities such as "Session Attendance", "Deliverable Submission", etc. will be part of the base activities of the program.
Are activities the same as "sessions" you mentioned (attendance tracking)?
No, activities are not the same as "sessions". Sessions are the meetings where the program is held. Activities are the tasks that the user needs to complete to achieve the program's goal.
Example structure:
Program: De Cero a Chamba
├─ Activity: Session 1 - Git Basics (attendance)
├─ Activity: Session 2 - HTML/CSS (attendance)
└─ Activity: Bounty - Build Portfolio (submission)
Q4: Attendance vs Submissions
Attendance: Just check-in/check-out (present/absent)?
Yes, attendance is just check-in/check-out (present/absent).
Submissions: Work artifacts that get reviewed?
Yes, submissions are work artifacts that get reviewed.
Can one activity have both attendance AND submission requirements?
No, attendance is an activity that is not a submission.
Who marks attendance? (self-reported, admin verified, automated?)
Admins and moderators will mark attendance. We will also use onchain attendance tracking for some activities (POAPs)
Programs Table Design
Q5: Program Properties
What data do programs need?
Name, description, duration? Name, description, duration, start/end dates, prerequisites, completion criteria, admins, moderators, activities, attendees, submissions, rewards, etc.
Start/end dates (cohort-based)?
Yes, programs are cohort-based.
Max participants?
No, programs are not limited by the number of participants. We can use it in the UI as a growth mechanic but we don't need to enforce it in the database/application logic.
Prerequisites?
Yes - Github account setup, Twitter account setup, LinkedIn account setup, Telegram account setup, etc.
Completion criteria?
Yes, completion criteria are the activities that the user needs to complete to achieve the program's goal. Build a portfolio website, deploy a DeFi app, etc.
Q6: Program Lifecycle
Are programs cohort-based (Feb 2025 cohort, March 2025 cohort)? Yes, programs are cohort-based.
Or evergreen (join anytime, self-paced)? No, programs are not evergreen. Just the "Open" program is evergreen.
Do programs have phases/modules/weeks? No, programs are not phased.
They can have phases/modules/weeks, but they are not required.
User Journey
Q7: Multi-Program Participation
Can approved users participate in multiple programs simultaneously?
No, users can only participate in one program at a time. Open program is the only exception, it's like the default as we expect most users to start with the open program and/or keep working on their own projects during other programs. We actually expect them to deliver a project at the end of a program and they can keep working on it while participating in other programs.
Can users switch programs after joining?
No, users can only participate in one program at a time. Open program is the only exception, it's like the default as we expect most users to start with the open program and/or keep working on their own projects during other programs. We actually expect them to deliver a project at the end of a program and they can keep working on it while participating in other programs.
Can users re-apply after rejection?
Yes, users can re-apply after rejection. They will be able to apply to the same program or a different program.
Can users apply to a different program after completing one?
Yes, users can apply to a different program after completing one. They will be able to apply to the same program or a different program.
Q8: Onboarding Form Changes
Current:
Email → Username → Display Name → Bio → Avatar → Complete

Proposed:
Email → Username → Display Name → Bio → Avatar
→ Choose Program → Set Goal → Link social accounts (GitHub, X) → Apply/Submit
Is this the right flow?
Yes, this is the right flow.
Should program selection come before or after profile fields?
After profile fields.
Should goal be program-specific or general?
General.
Integration with Existing Features
Q9: Applications Table Usage You have an existing applications table. Should we:
Extend it with new fields (program_id, goal, status)?
Yes, we should extend the existing applications table with new fields (program_id, goal, status).
Replace it with new structure?
No, we should keep the existing applications table and add separate programs and program_activities tables.
Keep it and add separate programs and program_activities tables?
Yes, we should keep the existing applications table and add separate programs and program_activities tables.
Current applications table likely tracks:

- User signup applications (pending/approved/rejected)
  New requirements added:
- Program selection
- Goal commitment
- Social accounts linking
  Q10: Activities Integration You mentioned existing activities + submissions. Are these:
  Generic activities (tutorials, challenges, bounties)?
  Should these now be linked to programs?
  No, some activities are program-agnostic and some are program-specific.
  Or keep some activities program-agnostic?
  Yes, some activities are program-agnostic and some are program-specific.
  📋 Assumptions to Validate
  Based on your description, I'm assuming:
  Application Flow: User applies → Admin reviews → Approved users can participate in activities and submit deliverables
  Goal Commitment: Required field, free-form text, tracked (We will use the activities and submissions to track the progress of the user). We will also use the activities and submissions to track the progress of the user.
  Programs: Fixed set (De Cero a Chamba, DeFi-esta, Open), can add more later
  Attendance: Simple present/absent tracking per session/activity. We will also use onchain attendance tracking for some activities (POAPs)
  Progress: Measured by activities completed + attendance
  Activities: Can be linked to programs, some may be program-specific
