// Replace with your RestDB API key
const RESTDB_API_KEY = '677f31d996bc7400895f1141';
const RESTDB_URL = 'https://mokesellcustomers-cfe3.restdb.io/rest/accounts';
let currentMode = 'signin';
const authSwitchLink = document.getElementById('authSwitchLink');
const confirmPasswordField = document.getElementById('confirmPassword');
const title = document.querySelector('.auth-title');
const countryField = document.getElementById('countryField');
const nameField = document.getElementById('nameField');
const forgotPassword = document.querySelector('.fg-password');
const passwordRequirements = document.querySelector('.password-requirements');
const submitButton = document.querySelector('.submit-button');


const alertContainer = document.createElement('div');
alertContainer.className = 'alert-container';
document.body.appendChild(alertContainer);

let activeTimeout;

function showAlert(message, type = 'success', duration = 5000) {
  // Clear any existing alerts
  alertContainer.innerHTML = '';
  
  // Create alert element
  const alert = document.createElement('div');
  alert.className = `alert ${type}`;
  
  // Add message
  alert.innerHTML = `
    ${message}
    <button class="close-btn" onclick="closeAlert()">&times;</button>
  `;
  
  // Add alert to container
  alertContainer.appendChild(alert);
  
  // Show alert
  setTimeout(() => {
    alertContainer.style.top = '20px';
  }, 100);
  
  // Clear any existing timeout
  if (activeTimeout) {
    clearTimeout(activeTimeout);
  }
  
  // Auto-hide after duration
  activeTimeout = setTimeout(() => {
    closeAlert();
  }, duration);
}

function closeAlert() {
  alertContainer.style.top = '-100px';
  
  // Clear timeout if exists
  if (activeTimeout) {
    clearTimeout(activeTimeout);
  }
}


function switchAuthMode() {
    const isSignIn = currentMode === 'signin';

    // Toggle mode
    currentMode = isSignIn ? 'signup' : 'signin';

    // Update UI elements based on the current mode
    nameField.style.display = isSignIn ? 'block' : 'none';
    countryField.style.display = isSignIn ? 'block' : 'none';
    forgotPassword.style.display = isSignIn ? 'none' : 'block';
    passwordRequirements.style.display = isSignIn ? 'block' : 'none';
    confirmPasswordField.style.display = isSignIn ? 'block' : 'none';
    submitButton.textContent = isSignIn ? 'Sign Up' : 'Sign In';
    title.textContent = isSignIn ? 'Create account' : 'Welcome back';

    // Update the switch link text
    authSwitchLink.innerHTML = isSignIn 
        ? 'Already have an account? <a href="#" onclick="switchAuthMode()" style="color: var(--primary-color);">Sign in</a>' 
        : 'Don\'t have an account? <a href="#" onclick="switchAuthMode()" style="color: var(--primary-color);">Create account</a>';
}

async function checkEmail(email) {
    // Regular expression to validate the email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Check if email matches the regular expression
    if (emailRegex.test(email)) {
        return true; // Email is in a valid format
    } else {
        return false; // Email is not in a valid format
    }
}


async function handleSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const country = document.getElementById('countryDropdown').value;


    //Set button to loading state
    const submitButton = document.querySelector('.submit-button');
    submitButton.disabled = true;
    submitButton.textContent = 'Loading...';



    try {
        if (currentMode === 'signup') {
            const emailError = document.querySelector('.email-error');
            const  passwordError = document.querySelector('.confirmPassword-error');
        
        
            // Check if email is valid
            const isEmailValid = await checkEmail(email);
            if (!isEmailValid) {
                emailError.textContent = 'Invalid email format';
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
                return;
            }
        
            // Check if passwords match
            const checkPassword = await checkConfirmPassword(passwordField, cfpw);
            if (!checkPassword) {
                passwordError.textContent = 'Passwords do not match';
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
                return;
            }

            // Check if user already exists
            const checkUser = await fetch(`${RESTDB_URL}?q={"email":"${email}"}`, {
                headers: {
                    'x-apikey': RESTDB_API_KEY
                }
            });
            const existingUser = await checkUser.json();

            if (existingUser.length > 0) {
                showAlert('Email already registered', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Sign In';
                return;
            }




            // Create new user
            const response = await fetch(RESTDB_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-apikey': RESTDB_API_KEY
                },
                body: JSON.stringify({
                    email,
                    password, // Note: In a real application, password should be hashed
                    name,
                    country,
                    createdAt: new Date()
                })
            });

            if (response.ok) {
                showAlert('Account created successfully!', 'success');
                
                setTimeout(() => window.location.href = '/', 1500);
                submitButton.disabled = false;
                submitButton.textContent = 'Sign In';
            } else {

                showAlert('Error creating account', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Sign In';
            }
        } else {
            // Sign in
            const response = await fetch(`${RESTDB_URL}?q={"email":"${email}","password":"${password}"}`, {
                headers: {
                    'x-apikey': RESTDB_API_KEY
                }
            });
            const user = await response.json();

            if (user.length > 0) {
                // Store user session
                localStorage.setItem('user', JSON.stringify(user[0]));
                submitButton.disabled = true;
                submitButton.textContent = 'Sign In';
                window.location.href = "loggedIn-Main/logIndex.html";
                
            } else {
                showAlert('Invalid email or password', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Sign In';
            }
        }
    } catch (error) {
        showAlert('An error occurred', 'error');
        console.error('Error:', error);
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';
    }
}

const passwordInput = document.getElementById('password');
const lengthRequirement = document.getElementById('lengthRequirement');
const uppercaseRequirement = document.getElementById('uppercaseRequirement');
const numberRequirement = document.getElementById('numberRequirement');

passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;

    // Check requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isValidLength = password.length >= 8;

    // Update the UI for password requirements
    lengthRequirement.classList.toggle('valid', isValidLength);
    uppercaseRequirement.classList.toggle('valid', hasUppercase);
    numberRequirement.classList.toggle('valid', hasNumber);
});


const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
    "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
    "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Congo (Democratic Republic)",
    "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Denmark", "Djibouti", "Dominica",
    "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
    "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
    "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
    "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Korea (North)", "Korea (South)", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
    "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
    "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands",
    "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama",
    "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
    "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
    "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];


const dropdown = document.getElementById('countryDropdown');


countries.forEach(country => {

    const option = document.createElement('option');

    option.value = country; // Set the value to the country name

    option.textContent = country; // Set the displayed text to the country name

    dropdown.appendChild(option); // Append the option to the dropdown

});


// Get the elements
const passwordField = document.getElementById("password");
const showPasswordCheckbox = document.getElementById("showPasswordCheckbox");
const cfpw = document.getElementById("cfPw");
const passwordError = document.getElementById("confirmPassword-error");

// Add event listener to the checkbox to toggle password visibility
showPasswordCheckbox.addEventListener("change", () => {
    // If checkbox is checked, show the password
    if (showPasswordCheckbox.checked) {
        passwordField.type = "text";
        cfpw.type = "text";
    } else {
        // If checkbox is unchecked, hide the password
        passwordField.type = "password";
        cfpw.type = "password";
    }
});

async function checkConfirmPassword(passwordField, cfpw){
    if(passwordField.value !== cfpw.value){ 
        return false;
    } else {
        return true;
    }
}

  