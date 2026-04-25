/**
 * Razorpay Payment Integration Utility
 * Handles payment order creation and verification
 */

import axios from 'axios'

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true))
      existingScript.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const initiateRazorpayPayment = async (
  orderId,
  amount,
  keyId,
  companyEmail,
  onSuccess,
  onError
) => {
  const options = {
    key: keyId,
    amount: amount, // Amount in paise
    currency: 'INR',
    name: 'Perekrut AI',
    description: 'Subscription Plan Upgrade',
    order_id: orderId,
    prefill: {
      email: companyEmail,
      contact: '', // Optional phone number
    },
    theme: {
      color: '#3399cc',
    },
    // Explicitly enable methods and prioritize UPI in checkout UI.
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
      paylater: true,
    },
    config: {
      display: {
        sequence: ['block.upi', 'block.card', 'block.netbanking', 'block.wallet', 'block.paylater'],
        blocks: {
          upi: {
            name: 'Pay by UPI',
            instruments: [
              {
                method: 'upi',
              },
            ],
          },
          card: {
            name: 'Pay by Card',
            instruments: [
              {
                method: 'card',
              },
            ],
          },
        },
      },
    },
    handler: function (response) {
      // Call success callback with payment details
      onSuccess({
        razorpayOrderId: orderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      })
    },
    modal: {
      ondismiss: function () {
        // User dismissed the payment modal
        onError('Payment cancelled by user')
      },
    },
  }

  try {
    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (error) {
    console.error('Error opening Razorpay:', error)
    onError('Failed to open payment gateway')
  }
}

export const createPaymentOrder = async (planId, token) => {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/payments/create-order`,
      { planId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return data.data
  } catch (error) {
    console.error('Error creating payment order:', error)
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      'Failed to create payment order'
    throw new Error(errorMessage)
  }
}

export const verifyPaymentSignature = async (paymentData, token) => {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/payments/verify`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return data.data
  } catch (error) {
    console.error('Error verifying payment:', error)
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      'Payment verification failed'
    throw new Error(errorMessage)
  }
}

export const getPaymentHistory = async (page = 1, limit = 10, token) => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/payments/history?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return data.data
  } catch (error) {
    console.error('Error fetching payment history:', error)
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      'Failed to fetch payment history'
    throw new Error(errorMessage)
  }
}
