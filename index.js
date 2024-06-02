document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('toggleButton');
  const headerItems = document.querySelector('.header');
  const toggleImage = document.getElementById('toggleImage');
  let toggleState = true;

  const updateNavbarDisplay = () => {
    const isMobile = window.matchMedia("screen and (max-width: 1124px)").matches;
    
    if (isMobile) {
      headerItems.style.display = 'none';
      toggleImage.src = './assets/img/ham.png';
      button.style.display = 'block';

      button.addEventListener('click', toggleNavbar);
    } else {
      headerItems.style.display = 'block';
      button.style.display = 'none';

      // Remove the event listener to prevent adding multiple listeners
      button.removeEventListener('click', toggleNavbar);
    }
  };

  const toggleNavbar = () => {
    toggleState = !toggleState;
    headerItems.style.display = toggleState ? 'block' : 'none';
    toggleImage.src = toggleState ? './assets/img/close.png' : './assets/img/ham.png';
  };

  window.addEventListener('resize', updateNavbarDisplay);

  // Initial check on page load
  updateNavbarDisplay();
  fetchPatientData();

  const ctx = document.getElementById('bloodPressureChart').getContext('2d');
  const months = ['Oct 2023', 'Nov 2023', 'Dec 2023', 'Jan 2024', 'Feb 2024', 'Mar 2024'];
  const systolicReadings = [120, 115, 160, 110, 150, 160];
  const diastolicReadings = [115, 60, 100, 90, 70, 80, 180];

  const bloodPressureChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: months,
          datasets: [{
              label: 'Systolic',
              data: systolicReadings,
              borderColor: '#E66FD2',
              pointBackgroundColor: '#E66FD2',
              borderWidth: 2,
              fill: false,
              cubicInterpolationMode: 'monotone' 
          }, {
              label: 'Diastolic',
              data: diastolicReadings,
              borderColor: '#7E6CAB',
              pointBackgroundColor: '#7E6CAB',
              borderWidth: 2,
              fill: false,
              cubicInterpolationMode: 'monotone' 
          }]
      },
      options: {
        scales: {
          yAxes: [{
              ticks: {
                  min: 60,
                  max: 180,
                  stepSize: 20,
                  callback: function(value) {
                      return value; 
                  }
              },
          }],
      }
      }
  });
});

// Functions related to patient data
function getEncodedAuth() {
  const username = 'coalition';
  const password = 'skills-test';
  const authString = `${username}:${password}`;
  return btoa(authString);
}

async function fetchPatientData() {
  const encodedAuth = getEncodedAuth();
  const response = await fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
    headers: {
      'Authorization': `Basic ${encodedAuth}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    const jessicaData = data.find(patient => patient.name === 'Jessica Taylor');
    if (jessicaData) {
      displayPatientData(jessicaData);
    } else {
      console.error('Jessica Taylor data not found.');
    }
  } else {
    console.error('Failed to fetch patient data.');
  }
}

function displayPatientData(patientData) {
  document.getElementById('patient-profile-picture').src = patientData.profile_picture;
  document.getElementById('patient-profile').src = patientData.profile_picture;
  document.getElementById('patient-name').textContent = patientData.name;
  document.getElementById('patient-gender').textContent = patientData.gender;
  document.getElementById('patient-age-gender').textContent = `${patientData.gender}, ${calculateAge(patientData.date_of_birth)}`;
  document.getElementById('patient-phone').textContent = patientData.phone_number;
  document.getElementById('patient-emergency-contact').textContent = patientData.emergency_contact;
  document.getElementById('patient-insurance').textContent = patientData.insurance_type;
  var dateOfBirth = new Date(patientData.date_of_birth);
  var formattedDate = dateOfBirth.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('patient-dob').textContent = formattedDate;
  displayLabResults(patientData.lab_results);

  const systolicValue = patientData.diagnosis_history[0].blood_pressure.systolic.value;
  const systolicComment = patientData.diagnosis_history[0].blood_pressure.systolic.levels;
  document.getElementById('systolic-value').textContent = systolicValue;
  document.getElementById('systolic-comment').textContent = systolicComment;

  const diastolicValue = patientData.diagnosis_history[0].blood_pressure.diastolic.value;
  const diastolicComment = patientData.diagnosis_history[0].blood_pressure.diastolic.levels;
  document.getElementById('diastolic-value').textContent = diastolicValue;
  document.getElementById('diastolic-comment').textContent = diastolicComment;

  const diagnosticList = document.getElementById('diagnostic-list');
  diagnosticList.innerHTML = '';
  patientData.diagnostic_list.forEach(diagnostic => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = diagnostic.name;
    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = diagnostic.description;
    const statusCell = document.createElement('td');
    statusCell.textContent = diagnostic.status;

    row.appendChild(nameCell);
    row.appendChild(descriptionCell);
    row.appendChild(statusCell);
    diagnosticList.appendChild(row);
  });

  const latestDiagnosticEntry = patientData.diagnosis_history[0];
  const heartRate = latestDiagnosticEntry.heart_rate.value;
  const respiratoryRate = latestDiagnosticEntry.respiratory_rate.value;
  const temperature = latestDiagnosticEntry.temperature.value;
  const heartRateLevels = latestDiagnosticEntry.heart_rate.levels;
  const respiratoryRateLevels = latestDiagnosticEntry.respiratory_rate.levels;
  const temperatureLevels = latestDiagnosticEntry.temperature.levels;

  document.getElementById('heart-rate').textContent = `${heartRate} `;
  document.getElementById('respiratory-rate').textContent = `${respiratoryRate} `;
  document.getElementById('temperature').textContent = `${temperature}`;

  document.getElementById('heart-rate-levels').textContent = `${heartRateLevels} `;
  document.getElementById('respiratory-rate-levels').textContent = `${respiratoryRateLevels} `;
  document.getElementById('temperature-levels').textContent = `${temperatureLevels}`;

  const labResultsList = document.getElementById('lab-results-list');
  labResultsList.innerHTML = '';
  patientData.lab_results.forEach(result => {
    const labResultDiv = document.createElement('div');
    labResultDiv.className = 'lab-result';
    const labResultText = document.createElement('p');
    labResultText.textContent = result;
    const labResultIcon = document.createElement('img');
    labResultIcon.src = './assets/img/downloads.svg';

    labResultDiv.appendChild(labResultText);
    labResultDiv.appendChild(labResultIcon);
    labResultsList.appendChild(labResultDiv);
  });
}

function displayLabResults(labResults) {
  const labsContainer = document.getElementById('labs-container');
  labsContainer.innerHTML = ''; 

  labResults.forEach(result => {
      const labResultContainer = document.createElement('div');
      labResultContainer.classList.add('lab-result');

      const image = document.createElement('img');
      image.src = './assets/img/downloads.svg';
      image.alt = 'Lab Icon';

      const content = document.createElement('div');
      content.textContent = result;

      if (result === "CT Scans") {
          labResultContainer.classList.add('ct-scan');
      }

      labResultContainer.appendChild(content);
      labResultContainer.appendChild(image);

      labsContainer.appendChild(labResultContainer);
  });
}

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}
