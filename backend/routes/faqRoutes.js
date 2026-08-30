const express = require('express');
const router = express.Router();

const faqData = [
  {
    keywords: ['order', 'track', 'shipping', 'delivery', 'where is my order'],
    answer: 'You can track your order from your profile page after checkout. If your order is still processing, it may take a little time before tracking information appears.'
  },
  {
    keywords: ['return', 'refund', 'cancel', 'exchange'],
    answer: 'Returns and exchanges are accepted within 30 days if the product is unused and in its original condition. Please check our return policy page for detailed instructions.'
  },
  {
    keywords: ['payment', 'razorpay', 'checkout', 'pay'],
    answer: 'Payments are securely processed through Razorpay during checkout. You can complete the purchase using the available payment options on the checkout page.'
  },
  {
    keywords: ['account', 'login', 'password', 'signup', 'register'],
    answer: 'You can create an account by registering from the login page. If you already have an account, use your email and password to log in.'
  },
  {
    keywords: ['contact', 'support', 'help', 'customer care'],
    answer: 'For additional help, please contact the Anvexa support team through the contact details available on the website or support section.'
  },
  {
    keywords: ['delivery time', 'how long', 'shipping time', 'arrive', 'dispatch'],
    answer: 'Delivery times depend on your location and the product, but most orders are processed within a few business days before shipping.'
  },
  {
    keywords: ['stock', 'available', 'out of stock', 'in stock'],
    answer: 'Product availability is shown on the product page. If an item is out of stock, you can check back later or choose a similar product.'
  },
  {
    keywords: ['cart', 'basket', 'add to cart', 'shopping cart'],
    answer: 'You can add products to your cart from the product page or product cards, then proceed to checkout when you are ready.'
  },
  {
    keywords: ['forgot', 'reset password', 'recover account'],
    answer: 'If you cannot sign in, please use the account recovery or login help option available on the authentication page, or contact support for assistance.'
  }
];

const findBestAnswer = (question) => {
  const normalizedQuestion = question.toLowerCase();

  for (const item of faqData) {
    const matched = item.keywords.some((keyword) => normalizedQuestion.includes(keyword));
    if (matched) {
      return item.answer;
    }
  }

  return 'I am not sure about that yet. Please try asking about orders, payments, returns, login, or shipping support.';
};

router.post('/ask', (req, res) => {
  const question = req.body?.question || '';

  if (!question.trim()) {
    return res.status(400).json({
      answer: 'Please enter a question so I can help you.'
    });
  }

  const answer = findBestAnswer(question);

  return res.json({
    answer
  });
});

module.exports = router;
