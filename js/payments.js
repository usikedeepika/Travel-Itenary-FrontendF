// Payment handling module
const PAYMENT_API = 'https://travel-planner-backend-i299.onrender.com/api/payments/process';

class PaymentHandler {
    constructor() {
        this.selectedPaymentMethod = 'pm_card_visa';
        this.selectedPlan = 'PRO';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSummary();
    }

    setupEventListeners() {
        // Payment method selection
        document.querySelectorAll('.payment-method-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget);
            });
        });

        // Subscription plan selection
        document.querySelectorAll('.subscription-plan-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectSubscriptionPlan(e.currentTarget);
            });
        });

        // Form input changes
        document.getElementById('currency').addEventListener('change', () => this.updateSummary());

        // Form submission
        document.getElementById('paymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });

        // Real-time validation
        this.setupValidation();
    }

    selectPaymentMethod(selectedCard) {
        // Remove selection from all cards
        document.querySelectorAll('.payment-method-card').forEach(card => {
            card.classList.remove('selected');
            const checkIcon = card.querySelector('.fa-check-circle');
            if (checkIcon) checkIcon.style.display = 'none';
        });

        // Add selection to clicked card
        selectedCard.classList.add('selected');
        const checkIcon = selectedCard.querySelector('.fa-check-circle') || 
                         this.createCheckIcon(selectedCard);
        checkIcon.style.display = 'inline';

        // Update selected method
        this.selectedPaymentMethod = selectedCard.dataset.method;
        document.getElementById('paymentMethodId').value = this.selectedPaymentMethod;
        
        this.updateSummary();
    }

    createCheckIcon(card) {
        const checkIcon = document.createElement('i');
        checkIcon.className = 'fas fa-check-circle text-success ms-auto';
        const container = card.querySelector('.d-flex');
        container.appendChild(checkIcon);
        return checkIcon;
    }

    selectSubscriptionPlan(selectedCard) {
        // Remove selection from all plan cards
        document.querySelectorAll('.subscription-plan-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        selectedCard.classList.add('selected');

        // Update selected plan
        this.selectedPlan = selectedCard.dataset.plan;
        document.getElementById('selectedPlan').value = this.selectedPlan;
        
        // Update amount based on selected plan
        const planPrice = parseFloat(selectedCard.dataset.price);
        document.getElementById('amount').value = planPrice;
        
        this.updateSummary();
    }

    updateSummary() {
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        const currency = document.getElementById('currency').value;
        const paymentMethodText = this.getPaymentMethodText();

        // Update summary displays
        document.getElementById('summaryAmount').textContent = this.formatCurrency(amount, currency);
        document.getElementById('summaryCurrency').textContent = currency.toUpperCase();
        document.getElementById('summaryMethod').textContent = paymentMethodText;
        document.getElementById('summaryPlan').textContent = this.selectedPlan;
        document.getElementById('summaryTotal').textContent = this.formatCurrency(amount, currency);
    }

    getPaymentMethodText() {
        const methodMap = {
            'pm_card_visa': 'Visa Card',
            'pm_card_mastercard': 'Mastercard',
            'pm_card_amex': 'American Express'
        };
        return methodMap[this.selectedPaymentMethod] || 'Card';
    }

    formatCurrency(amount, currency) {
        const symbols = {
            'usd': '$',
            'eur': '€',
            'gbp': '£',
            'cad': 'C$'
        };
        const symbol = symbols[currency] || '$';
        return `${symbol}${amount.toFixed(2)}`;
    }

    setupValidation() {
        const form = document.getElementById('paymentForm');
        // Remove amount input validation since it's now set by plan selection
    }

    async processPayment() {
        // Validate form
        const form = document.getElementById('paymentForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Get form data
        const amount = parseFloat(document.getElementById('amount').value);
        const currency = document.getElementById('currency').value;

        // Validate required data
        if (!amount || amount <= 0) {
            this.showError('Please select a subscription plan');
            return;
        }

        // Get auth data
        const token = auth.getToken();
        const currentUser = auth.getCurrentUser();
        
        if (!token || !currentUser) {
            this.showError('Authentication required. Please log in again.');
            window.location.href = 'signin.html';
            return;
        }

        // Show processing overlay
        this.showProcessingOverlay();

        try {
            // Prepare payment data
            const paymentData = {
                amount: amount,
                currency: currency,
                paymentMethodId: this.selectedPaymentMethod,
                paymentType: "gateway",
                subscriptionPlan: this.selectedPlan
            };

            console.log('Processing payment:', paymentData);

            // Make API call
            const response = await fetch(PAYMENT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'userName': currentUser.userName
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            if (response.ok) {
                // Store subscription plan in localStorage
                const currentUser = auth.getCurrentUser();
                if (currentUser) {
                    currentUser.membershipPlan = this.selectedPlan;
                    localStorage.setItem('CURRENT_USER', JSON.stringify(currentUser));
                }
                
                this.showSuccess(result, paymentData);
                
                // Redirect to home after 3 seconds
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 3000);
            } else {
                throw new Error(result.message || 'Payment processing failed');
            }

        } catch (error) {
            console.error('Payment error:', error);
            this.showError(error.message || 'Payment processing failed. Please try again.');
        } finally {
            this.hideProcessingOverlay();
        }
    }

    showProcessingOverlay() {
        document.getElementById('processingOverlay').style.display = 'flex';
    }

    hideProcessingOverlay() {
        document.getElementById('processingOverlay').style.display = 'none';
    }

    showSuccess(result, paymentData) {
        const resultDiv = document.getElementById('paymentResult');
        const currency = paymentData.currency.toUpperCase();
        const amount = this.formatCurrency(paymentData.amount, paymentData.currency);
        
        resultDiv.innerHTML = `
            <div class="alert alert-success shadow-sm">
                <div class="d-flex align-items-center mb-3">
                    <i class="fas fa-check-circle text-success me-3" style="font-size: 2rem;"></i>
                    <div>
                        <h4 class="alert-heading mb-1">Payment Successful!</h4>
                        <p class="mb-0">Your payment has been processed successfully.</p>
                    </div>
                </div>
                
                <hr>
                
                <div class="row">
                    <div class="col-md-6">
                        <strong>Transaction ID:</strong><br>
                        <code>${result.transactionId || result.id || 'N/A'}</code>
                    </div>
                    <div class="col-md-6">
                        <strong>Amount:</strong><br>
                        ${amount} ${currency}
                    </div>
                </div>
                
                <div class="row mt-2">
                    <div class="col-md-6">
                        <strong>Payment Method:</strong><br>
                        ${this.getPaymentMethodText()}
                    </div>
                    <div class="col-md-6">
                        <strong>Plan:</strong><br>
                        ${this.selectedPlan}
                    </div>
                </div>
                
                <div class="row mt-2">
                    <div class="col-md-6">
                        <strong>Status:</strong><br>
                        <span class="badge bg-success">Completed</span>
                    </div>
                    <div class="col-md-6">
                        <strong>Billing:</strong><br>
                        Monthly Subscription
                    </div>
                </div>
                
                <div class="mt-3">
                    <button class="btn btn-primary me-2" onclick="window.print()">
                        <i class="fas fa-print me-1"></i> Print Receipt
                    </button>
                    <button class="btn btn-outline-primary" onclick="window.location.href='home.html'">
                        <i class="fas fa-home me-1"></i> Go to Home
                    </button>
                </div>
                
                <div class="mt-2 text-center">
                    <small class="text-muted">Redirecting to home page in 3 seconds...</small>
                </div>
            </div>
        `;
        
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth' });
        
        // Scroll to result
        setTimeout(() => {
            resultDiv.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    showError(message) {
        const resultDiv = document.getElementById('paymentResult');
        
        resultDiv.innerHTML = `
            <div class="alert alert-danger shadow-sm">
                <div class="d-flex align-items-center">
                    <i class="fas fa-exclamation-triangle text-danger me-3" style="font-size: 2rem;"></i>
                    <div>
                        <h4 class="alert-heading mb-1">Payment Failed</h4>
                        <p class="mb-0">${message}</p>
                    </div>
                </div>
                
                <hr>
                
                <div>
                    <button class="btn btn-danger me-2" onclick="paymentHandler.resetForm()">
                        <i class="fas fa-redo me-1"></i> Try Again
                    </button>
                    <button class="btn btn-outline-secondary" onclick="window.location.href='home.html'">
                        <i class="fas fa-home me-1"></i> Back to Home
                    </button>
                </div>
            </div>
        `;
        
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }

    resetForm() {
        // Reset form
        document.getElementById('paymentForm').reset();
        document.getElementById('paymentForm').classList.remove('was-validated');
        
        // Reset payment method selection
        this.selectedPaymentMethod = 'pm_card_visa';
        document.getElementById('paymentMethodId').value = this.selectedPaymentMethod;
        
        // Reset subscription plan selection
        this.selectedPlan = 'PRO';
        document.getElementById('selectedPlan').value = this.selectedPlan;
        
        // Reset payment method UI
        document.querySelectorAll('.payment-method-card').forEach(card => {
            card.classList.remove('selected');
            const checkIcon = card.querySelector('.fa-check-circle');
            if (checkIcon) checkIcon.style.display = 'none';
        });
        
        // Select first payment method
        const firstCard = document.querySelector('.payment-method-card');
        if (firstCard) {
            this.selectPaymentMethod(firstCard);
        }
        
        // Reset subscription plan selection
        document.querySelectorAll('.subscription-plan-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select PRO plan by default
        const proCard = document.querySelector('[data-plan="PRO"]');
        if (proCard) {
            this.selectSubscriptionPlan(proCard);
        }
        
        // Hide result
        document.getElementById('paymentResult').style.display = 'none';
        
        // Update summary
        this.updateSummary();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize payment handler when DOM is loaded
let paymentHandler;
document.addEventListener('DOMContentLoaded', () => {
    paymentHandler = new PaymentHandler();
});

// Export for global access
window.paymentHandler = paymentHandler; 