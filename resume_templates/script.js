const form = document.getElementById('resumeForm');
const renderBtn = document.getElementById('renderBtn');
const downloadBtn = document.getElementById('downloadBtn');
const buttons = document.querySelectorAll('.template-button');
const resume = document.getElementById('resume');

const getText = (id) => document.getElementById(id).value.trim();
const setText = (id, value) => {
  const el = document.getElementById(id);
  el.textContent = value;
};

const setVisibility = (sectionId, visible) => {
  const section = document.getElementById(sectionId);
  section.classList.toggle('hidden', !visible);
};

const setContactLine = (lineId, value) => {
  const el = document.getElementById(lineId);
  el.textContent = value;
  el.style.display = value ? 'block' : 'none';
};

const renderList = (value, listId, sectionId) => {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const list = document.getElementById(listId);
  const section = document.getElementById(sectionId);

  if (items.length === 0) {
    section.classList.add('hidden');
    list.innerHTML = '';
    return;
  }

  list.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
  section.classList.remove('hidden');
};

const renderResume = () => {
  const fullName = getText('fullName');
  const headline = getText('headline');
  const summary = getText('summary');
  const email = getText('email');
  const phone = getText('phone');
  const location = getText('location');
  const skills = getText('skills');
  const experienceTitle = getText('experienceTitle');
  const experienceEmployer = getText('experienceEmployer');
  const experienceDetails = getText('experienceDetails');
  const projectTitle = getText('projectTitle');
  const projectDetails = getText('projectDetails');
  const education = getText('education');
  const languages = getText('languages');
  const hobbies = getText('hobbies');

  setText('previewName', fullName);
  setText('previewRole', headline);
  setText('previewSummary', summary);
  setText('previewEducation', education);
  setText('previewProjectTitle', projectTitle);
  setText('previewProjectDetails', projectDetails);
  setText('previewExperienceTitle', experienceTitle);
  setText('previewExperienceEmployer', experienceEmployer);
  setText('previewLanguages', languages);
  setText('previewHobbies', hobbies);

  setContactLine('previewEmail', email);
  setContactLine('previewPhone', phone);
  setContactLine('previewLocation', location);

  setVisibility('summarySection', Boolean(summary));
  setVisibility('skillsSection', Boolean(skills));
  setVisibility('experienceSection', Boolean(experienceTitle || experienceEmployer || experienceDetails));
  setVisibility('projectsSection', Boolean(projectTitle || projectDetails));
  setVisibility('educationSection', Boolean(education));
  setVisibility('languagesSection', Boolean(languages));
  setVisibility('hobbiesSection', Boolean(hobbies));

  const contactHasValue = Boolean(email || phone || location);
  setVisibility('contactSection', contactHasValue);

  const experienceList = document.getElementById('previewExperienceDetails');
  if (experienceDetails) {
    const bullets = experienceDetails
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    experienceList.innerHTML = bullets.map((item) => `<li>${item}</li>`).join('');
  } else {
    experienceList.innerHTML = '';
  }
};

const setTemplate = (template) => {
  resume.className = `resume-page ${template}`;
  buttons.forEach((btn) => btn.classList.toggle('active', btn.dataset.template === template));
};

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    setTemplate(button.dataset.template);
  });
});

renderBtn.addEventListener('click', renderResume);

downloadBtn.addEventListener('click', () => {
  window.print();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  renderResume();
});

window.addEventListener('DOMContentLoaded', () => {
  setTemplate('template1');
  renderResume();
});
