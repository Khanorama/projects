// Template responses for when the backend's AI is unavailable
export const generateWorkshopResponse = async ({ tool, prompt, profile }) => {
  const firstName = (profile.fullName || 'Student').trim().split(' ')[0];
  const profileContext =
    profile.skills || profile.interests || 'your current profile details and goals';

  if (tool === 'email') {
    return {
      title: 'Professional outreach draft',
      summary: `A basic email template filled in from your profile (${profileContext}).`,
      sections: [
        {
          label: 'Draft',
          text: `Subject: Interest in opportunities related to ${profile.interests || 'your field'}\n\nHello,\n\nMy name is ${firstName}, and I am reaching out because ${prompt}. I am especially interested in opportunities where I can contribute through ${profile.skills || 'my developing technical and communication skills'}. I would appreciate any guidance on potential openings or the best next step to learn more.\n\nThank you for your time,\n${firstName}`,
        },
        {
          label: 'Coach notes',
          text: 'Keep the final version under 150 words, personalize one sentence about the recipient, and end with a low-friction ask.',
        },
      ],
    };
  }

  if (tool === 'guidance') {
    return {
      title: 'Application game plan',
      summary: `A basic plan based on your profile (${profileContext}).`,
      sections: [
        {
          label: 'Recommended approach',
          text: `Start by clarifying the strongest evidence you already have. Based on your prompt, highlight experience in ${profile.skills || 'your current strengths'}, connect it to the opportunity, and show momentum rather than perfection.`,
        },
        {
          label: 'Next three moves',
          text: '1. Tailor your resume bullets to the exact role language.\n2. Prepare one story about initiative, one about learning, and one about collaboration.\n3. Build a deadline tracker for materials, outreach, and follow-up.',
        },
      ],
    };
  }

  return {
    title: 'Essay narrative starter',
    summary: `A basic essay outline based on ${profile.interests || 'your prompt'}.`,
    sections: [
      {
        label: 'Opening direction',
        text: `Your prompt: ${prompt}\n\nOpen with one specific moment that shows your interest, then explain how it shaped your goals.`,
      },
      {
        label: 'Draft body',
        text: `Describe one or two experiences${profile.skills ? ` where you used ${profile.skills}` : ''}: what you did, what was hard, and what you learned. Then explain why this program is the next step for you and what you hope to do there.`,
      },
    ],
  };
};
