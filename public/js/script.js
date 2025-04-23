document.addEventListener('DOMContentLoaded', function() {
    // Add current date to date input on event creation form
    const dateInput = document.getElementById('date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }
    
    // Form validation for registration
    const registrationForm = document.querySelector('form[action="/register"]');
    if (registrationForm) {
      registrationForm.addEventListener('submit', function(event) {
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('contactNo');
        
        // Simple email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
          alert('Please enter a valid email address');
          event.preventDefault();
          return;
        }
        
        // Simple phone validation (at least 10 digits)
        const phonePattern = /^\d{10,}$/;
        if (!phonePattern.test(phoneInput.value.replace(/\D/g, ''))) {
          alert('Please enter a valid phone number (at least 10 digits)');
          event.preventDefault();
          return;
        }
      });
    }
    
    // Enable Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  });