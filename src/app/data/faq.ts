export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  adminOnly?: boolean;
};

export type FaqCategory = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const HOME_FAQ_CATEGORIES: FaqCategory[] = [
  {
    "id": "cat-1",
    "title": "Getting Access to the Portal",
    "items": [
      {
        "id": "q1",
        "question": "How do I log in to the portal?",
        "answer": "Visit [portal.nphcofhudsoncounty.org](https://portal.nphcofhudsoncounty.org). You'll be prompted to sign in through Cloudflare Access. Use the email address associated with your chapter \u2014 this is the address that the VP has on file in the chapter distribution list. Enter that email and follow the one-time verification link that gets sent to your inbox.",
        "adminOnly": false
      },
      {
        "id": "q2",
        "question": "Which email address do I use to log in?",
        "answer": "You must use the email that your chapter has on file with the NPHC of Hudson County council. This is managed by the VP and maintained in the chapter Google distribution list. If you've ever received official NPHC of Hudson County emails, try that address first. If you're unsure, contact your chapter's delegate or reach out to the VP before attempting to log in.",
        "adminOnly": false
      },
      {
        "id": "q3",
        "question": "I keep getting an \"access denied\" message. What do I do?",
        "answer": "An access denied message usually means the email you're using isn't on the approved access list. First, confirm with your chapter's delegate or the VP which email is on file for your chapter. Once you have the correct email, try again. If the problem continues, use the Help option on the portal or email nphcofhudsoncounty@gmail.com directly.",
        "adminOnly": false
      },
      {
        "id": "q4",
        "question": "I never received the sign-in verification email. What should I do?",
        "answer": "Check your spam or junk folder first \u2014 the verification email sometimes gets filtered. Make sure you're checking the inbox for the exact email you entered at the login screen. If it still hasn't arrived after a few minutes, try the sign-in process again. If the issue persists, contact us at nphcofhudsoncounty@gmail.com.",
        "adminOnly": false
      },
      {
        "id": "q5",
        "question": "Can I share my login with another member of my chapter?",
        "answer": "No. Access is tied to individual email addresses and is chapter-specific. Each person who needs portal access must be added to the distribution list individually. If your chapter has a delegate change or a new member needs access, the chapter president or delegate should contact the VP or council president to have the new email added.",
        "adminOnly": false
      },
      {
        "id": "q6",
        "question": "My chapter's delegate changed. How do we update portal access?",
        "answer": "Contact the NPHC of Hudson County VP or President to have the new delegate's email added to the chapter distribution list and the access list. The outgoing delegate's access will be removed once the change is processed. Reach us at nphcofhudsoncounty@gmail.com or use the Help option inside the portal.",
        "adminOnly": false
      },
      {
        "id": "q7",
        "question": "I'm a new chapter coming onto the council. How does our chapter get portal access?",
        "answer": "New chapters are onboarded by the council President or VP. Once your chapter is officially added to the council, your designated delegate and officers will receive access. Reach out to nphcofhudsoncounty@gmail.com to begin the onboarding process.",
        "adminOnly": false
      }
    ]
  },
  {
    "id": "cat-2",
    "title": "Navigating the Portal",
    "items": [
      {
        "id": "q1",
        "question": "What sections are available on the portal?",
        "answer": "Once signed in, you'll have access to the following sections:\n- **Home** \u2014 President's message, updates, and quick navigation links\n- **Chapter Information** \u2014 Officer roster, chapter delegates, and governing documents\n- **Meetings & Delegates** \u2014 Upcoming meeting schedule, past records, and delegate reports\n- **Programs & Events** \u2014 Active events, archive, flyers, and signup forms\n- **Resources** \u2014 Shared forms, national D9 organization links, and training materials\n- **Decision Portal** \u2014 Vote on council motions and proposals between meetings\n- **Meeting Deck** \u2014 Live slides and voting tool used during General Body meetings\n- **Forum** \u2014 Threaded discussions for ongoing council topics\n- **Chat** \u2014 Real-time messaging for council members\n- **Forms Hub** \u2014 Submit chapter requests and reports",
        "adminOnly": false
      },
      {
        "id": "q2",
        "question": "Where do I find the council's governing documents \u2014 bylaws, constitution, etc.?",
        "answer": "Go to **Chapter Information** (`/chapter-information`). The Governing Docs section there contains all official council documents including the bylaws and constitution.",
        "adminOnly": false
      },
      {
        "id": "q3",
        "question": "Where can I find contact information for council officers?",
        "answer": "The executive officer roster with contact information is listed under **Chapter Information** \u2192 Officers section.",
        "adminOnly": false
      },
      {
        "id": "q4",
        "question": "Where do I find information about my chapter's delegate?",
        "answer": "Delegate assignments are also listed under **Chapter Information** \u2192 Delegates section.",
        "adminOnly": false
      },
      {
        "id": "q5",
        "question": "The portal looks different from what I remember. Was something updated?",
        "answer": "The portal is actively maintained and updated. If you notice a change, it's likely a content refresh or a new feature being rolled out. If something appears broken or missing, please report it using the Help option so the admin team can look into it.",
        "adminOnly": false
      },
      {
        "id": "q6",
        "question": "Can I use the portal on my phone?",
        "answer": "Yes, the portal is designed to be mobile-responsive. For the best experience, use an up-to-date browser such as Chrome, Safari, or Firefox. Some features like the Meeting Deck and voting tools work best on a desktop or tablet during live meetings.",
        "adminOnly": false
      }
    ]
  },
  {
    "id": "cat-3",
    "title": "Meetings & Voting",
    "items": [
      {
        "id": "q1",
        "question": "When and where are General Body meetings held?",
        "answer": "Upcoming meeting dates, times, and locations are posted under **Meetings & Delegates** \u2192 Upcoming Meetings. You'll also see them in the president's message on the Home page. Official meeting announcements are also sent to chapter distribution emails.",
        "adminOnly": false
      },
      {
        "id": "q2",
        "question": "How do I follow along during a General Body meeting?",
        "answer": "During a live meeting, open the **Meeting Deck** (`/meeting-deck`). The president will advance slides in real time and you'll see them on your screen. You don't need to do anything else to sync \u2014 the deck updates automatically.",
        "adminOnly": false
      },
      {
        "id": "q3",
        "question": "How does voting work during a meeting?",
        "answer": "When a vote is called during a General Body meeting, a voting prompt will appear directly inside the **Meeting Deck**. You'll see the motion text and the vote options. Select your chapter's vote and submit. Each chapter gets one vote. Results are recorded in real time. You do not need to navigate away from the deck to vote.",
        "adminOnly": false
      },
      {
        "id": "q4",
        "question": "Can I vote on a motion outside of a live meeting?",
        "answer": "Yes. Between-meeting votes are conducted through the **Decision Portal** (`/decision-portal`). When an active motion is open for a vote, it will appear there. Votes cast in the Decision Portal are recorded and tallied the same way as in-meeting votes.",
        "adminOnly": false
      },
      {
        "id": "q5",
        "question": "Where can I find the minutes from past meetings?",
        "answer": "Past meeting records and minutes are available under **Meetings & Delegates** \u2192 Meeting Records.",
        "adminOnly": false
      },
      {
        "id": "q6",
        "question": "Where do I find or submit delegate reports?",
        "answer": "Delegate reports are located under **Meetings & Delegates** \u2192 Delegate Reports. Reports submitted by your chapter's delegate will also appear there after submission.",
        "adminOnly": false
      },
      {
        "id": "q7",
        "question": "My chapter wasn't able to attend a meeting. How do we submit a report or communicate our position?",
        "answer": "Use the **Forum** to communicate positions on agenda items, or submit a delegate report through the Forms Hub (Committee Report form). If you have questions about attendance procedures, refer to the council's bylaws in Chapter Information or contact nphcofhudsoncounty@gmail.com.",
        "adminOnly": false
      }
    ]
  },
  {
    "id": "cat-4",
    "title": "Forms & Submissions",
    "items": [
      {
        "id": "q1",
        "question": "What forms are available on the portal?",
        "answer": "The **Forms Hub** (`/forms`) contains the following:\n- **Budget Submission Request** \u2014 Request a budget allocation for your chapter's activity\n- **Reimbursement Request** \u2014 Request reimbursement for approved chapter expenses\n- **Event Proposal & Budget Request** \u2014 Propose a new event with a budget breakdown\n- **Event Submission Form** \u2014 Submit details for an approved event to be listed on the portal\n- **Event Post-Report & Financial Reconciliation** \u2014 Report actuals after an event concludes\n- **Committee Report** \u2014 Submit a formal report on behalf of a committee\n- **Social Media Request** \u2014 Request that content be posted to council social media accounts\n- **My Submissions** \u2014 View and track the status of your previously submitted forms",
        "adminOnly": false
      },
      {
        "id": "q2",
        "question": "How do I know if my form submission was received?",
        "answer": "After submitting any form, you'll receive a confirmation message on screen. You can also check the status of your submissions anytime under **Forms Hub \u2192 My Submissions**.",
        "adminOnly": false
      },
      {
        "id": "q3",
        "question": "Can I edit or cancel a form I already submitted?",
        "answer": "Once submitted, forms are sent to the council admin for review. If you need to make a correction, use the Help option or email nphcofhudsoncounty@gmail.com referencing the form type and submission date and an admin will assist you.",
        "adminOnly": false
      },
      {
        "id": "q4",
        "question": "How long does it take to hear back after submitting a budget or reimbursement request?",
        "answer": "Processing timelines depend on the nature of the request and the current meeting schedule. Budget and reimbursement requests are reviewed by the Treasurer and may require a vote at the next General Body meeting. You'll be notified through your chapter's distribution email once action has been taken.",
        "adminOnly": false
      },
      {
        "id": "q5",
        "question": "What if I need to submit an event flyer or additional documents along with a form?",
        "answer": "Some forms include a file upload field. If a form you're completing doesn't have one and you need to attach supporting materials, include a note in the comments field and email the materials separately to nphcofhudsoncounty@gmail.com referencing your submission.",
        "adminOnly": false
      }
    ]
  },
  {
    "id": "cat-5",
    "title": "Events & Programs",
    "items": [
      {
        "id": "q1",
        "question": "Where can I see what events are coming up?",
        "answer": "Active and upcoming events are listed under **Programs & Events** (`/programs-events`). You'll also see featured events on the Home page.",
        "adminOnly": false
      },
      {
        "id": "q2",
        "question": "How do I sign up for an event?",
        "answer": "Event signup forms are available directly on the Programs & Events page. Find the event you're interested in and click the signup link. Some events may require an Event Submission form to be completed first \u2014 follow the instructions on the event listing.",
        "adminOnly": false
      },
      {
        "id": "q3",
        "question": "Where can I download event flyers?",
        "answer": "Event flyers are available under **Programs & Events** \u2192 Event Flyers. You can view and download flyers for both upcoming and past events.",
        "adminOnly": false
      },
      {
        "id": "q4",
        "question": "How do I submit an event to be listed on the portal?",
        "answer": "Use the **Event Submission Form** in the Forms Hub (`/forms/events`). Fill in all required details about the event. Once reviewed and approved by the council admin, it will appear on the Programs & Events page.",
        "adminOnly": false
      },
      {
        "id": "q5",
        "question": "Where can I find a record of past events?",
        "answer": "The **Event Archive** is accessible under Programs & Events. It contains records and documentation for previously held events.",
        "adminOnly": false
      },
      {
        "id": "q6",
        "question": "My chapter is organizing a program that needs council support. What do I do?",
        "answer": "Start with the **Event Proposal & Budget Request** form in the Forms Hub (`/forms/event-proposal-budget`). This allows you to formally propose the program and outline any budget needs. It will be reviewed by the council and may be brought to a General Body vote.",
        "adminOnly": false
      }
    ]
  },
  {
    "id": "cat-6",
    "title": "Chapter Information & Resources",
    "items": [
      {
        "id": "q1",
        "question": "Where can I find links to the national D9 organizations?",
        "answer": "All 9 national Divine Nine organization websites are listed under **Resources** (`/resources`) \u2192 National Organizations section.",
        "adminOnly": false
      },
      {
        "id": "q2",
        "question": "Where can I access training materials and reference documents?",
        "answer": "Training resources including the Comprehensive Data Brief, Compliance Standards guide, the Data Brief XLSX file, and the NotebookLM Mind Map are all available under **Resources** \u2192 Training Resources.",
        "adminOnly": false
      },
      {
        "id": "q3",
        "question": "Where can I find forms that are shared across all chapters?",
        "answer": "Shared council forms are available under **Resources** \u2192 Shared Forms. These are documents and templates that all chapters can access and use.",
        "adminOnly": false
      },
      {
        "id": "q4",
        "question": "I'm looking for a specific document but can't find it in Resources. What should I do?",
        "answer": "Try using the **Document Viewer** (`/viewer`) which provides direct access to council documents. If you still can't locate it, reach out through the Help option or email nphcofhudsoncounty@gmail.com with the name or type of document you need.",
        "adminOnly": false
      }
    ]
  },
  {
    "id": "cat-7",
    "title": "Compliance",
    "items": [
      {
        "id": "q1",
        "question": "What is the NPHC compliance form and who needs to complete it?",
        "answer": "The NPHC national compliance form is an annual requirement submitted through the national NPHC Gateway portal at gateway.nphchq.com. The Treasurer and Financial Secretary of the NPHC of Hudson County are responsible for completing it on behalf of the council. Individual chapter delegates do not need to complete this \u2014 it is a council-level obligation.",
        "adminOnly": false
      },
      {
        "id": "q2",
        "question": "When is the compliance form due?",
        "answer": "The compliance form deadline is **March 15**. The council's Treasurer and Financial Secretary are working to complete this ahead of the deadline.",
        "adminOnly": false
      },
      {
        "id": "q3",
        "question": "How can I check compliance status for the council or my chapter?",
        "answer": "Compliance status for the council is tracked internally. If you have specific compliance questions related to your chapter's standing with the national organization, contact your chapter's president or refer to your national org's guidelines. For council-level compliance questions, reach out to nphcofhudsoncounty@gmail.com.",
        "adminOnly": false
      },
      {
        "id": "q4",
        "question": "My chapter has its own compliance requirements with our national organization. Can the portal help with that?",
        "answer": "The portal's compliance tools are specific to NPHC of Hudson County council operations. For your chapter's national compliance requirements, you'll need to work directly with your national organization's portal or compliance officer.",
        "adminOnly": false
      }
    ]
  },
  {
    "id": "cat-8",
    "title": "Technical Help & Support",
    "items": [
      {
        "id": "q1",
        "question": "How do I get help if something isn't working on the portal?",
        "answer": "Use the **Help** option available in the portal's navigation. Submitting a Help request routes a message directly to the NPHC of Hudson County account (nphcofhudsoncounty@gmail.com), and someone from the council admin team will follow up with you.",
        "adminOnly": false
      },
      {
        "id": "q2",
        "question": "I can't get into the portal at all. How do I reach someone?",
        "answer": "If you're unable to access the portal, email us directly at **nphcofhudsoncounty@gmail.com**. Include your name, chapter, and the email address you're trying to use. We'll verify your access and get back to you as quickly as possible.",
        "adminOnly": false
      },
      {
        "id": "q3",
        "question": "The portal isn't loading or something looks broken. What should I do?",
        "answer": "First, try refreshing the page or clearing your browser cache (Ctrl+Shift+R on PC, Cmd+Shift+R on Mac). Make sure you're using an up-to-date browser. If the issue continues, report it through the Help option inside the portal or email nphcofhudsoncounty@gmail.com with a description of what you're seeing and which page it's occurring on.",
        "adminOnly": false
      },
      {
        "id": "q4",
        "question": "Which browsers are supported?",
        "answer": "The portal works best on the latest versions of **Google Chrome**, **Mozilla Firefox**, **Safari**, and **Microsoft Edge**. Internet Explorer is not supported. For live meeting features (Meeting Deck, real-time voting), Chrome or Firefox are recommended for the most reliable experience.",
        "adminOnly": false
      },
      {
        "id": "q5",
        "question": "Is the portal secure? How is my data protected?",
        "answer": "Yes. The portal is secured through Cloudflare Access, which means only verified email addresses on the approved list can sign in. No one can browse or access portal content without authentication. All connections are encrypted (HTTPS). The portal does not store sensitive financial or personal data beyond what is required for council operations.",
        "adminOnly": false
      },
      {
        "id": "q6",
        "question": "I have a suggestion to improve the portal. How do I share it?",
        "answer": "We welcome your feedback. Use the **Help** option in the portal to send a message, or email nphcofhudsoncounty@gmail.com with your suggestion. Portal improvements are reviewed by the council president and admin team on an ongoing basis.",
        "adminOnly": false
      },
      {
        "id": "q7",
        "question": "Can I access the portal on behalf of my chapter if I'm not the primary delegate?",
        "answer": "Access is granted per email address. If your email is on the approved list, you can sign in. If it's not, you'll need to be added by contacting the VP or council president. Each chapter typically has one or two designated contacts with portal access.",
        "adminOnly": false
      }
    ]
  }
] as const;
