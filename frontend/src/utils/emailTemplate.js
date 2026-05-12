export function generateThesisEmail({
  professorName = '[Last Name]',
  studentName = '[Your Name]',
  interests = '[your interests]',
  researchArea = '[research area/topic]',
  specificWork = '[specific topic/paper/project if applicable]',
  skills = '[mention relevant areas]',
  studentId = '[Student ID]',
  email = '[Email Address]',
  link = '[Optional: GitHub / Portfolio / LinkedIn]',
}) {
  return `Subject: Prospective Thesis Student Interested in Your Research

Dear Professor ${professorName},

I hope you are doing well. My name is ${studentName}, and I am currently a CSE student with a strong interest in research areas such as ${interests}.

I recently came across your work in ${researchArea}, and I found it genuinely inspiring, especially your work related to ${specificWork}. The way your research approaches real-world problems strongly matches the kind of work I hope to pursue during my thesis.

Over time, I have been building my skills through coursework, personal projects, and self-learning, particularly in areas like ${skills}. I am eager to deepen my understanding through research and contribute meaningfully under proper guidance.

I would be very grateful for the opportunity to work under your supervision for my thesis/research project. I am highly motivated, willing to learn, and committed to putting in consistent effort throughout the research process.

If possible, I would really appreciate the opportunity to discuss whether you are currently accepting thesis students or if there may be any opportunity to work with you in the future.

Thank you very much for your time and consideration. I look forward to hearing from you.

Sincerely,
${studentName}
${studentId}
${email}
${link}`;
}
