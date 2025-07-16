import Link from "next/link";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Simple
            <span className="block text-blue-600">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the coaching plan that fits your goals and budget. All plans include personalized training and ongoing support.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-4">Perfect for beginners</p>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $89
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-500">Billed monthly</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Personalized 12-week training plan
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Weekly plan adjustments
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Email support (48hr response)
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Monthly progress review
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Training app access
              </li>
            </ul>
            <Link 
              href="/contact" 
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all text-center block"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-blue-600 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Performance</h3>
              <p className="text-gray-600 mb-4">For serious runners</p>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $149
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-500">Billed monthly</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything in Starter plan
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Bi-weekly video consultations (30 min)
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority messaging support (24hr response)
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Race strategy development
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Nutrition guidance
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cross-training recommendations
              </li>
            </ul>
            <Link 
              href="/contact" 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all text-center block"
            >
              Start Training
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Elite</h3>
              <p className="text-gray-600 mb-4">Maximum support</p>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $249
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-500">Billed monthly</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything in Performance plan
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Weekly video consultations (45 min)
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                24/7 messaging support
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Custom strength training plan
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Race day support & pacing
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Recovery & injury prevention
              </li>
            </ul>
            <Link 
              href="/contact" 
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all text-center block"
            >
              Go Elite
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
                <p className="text-gray-600">Yes, you can cancel your subscription at any time. No long-term contracts or hidden fees.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What if I need to pause my training?</h4>
                <p className="text-gray-600">Life happens! You can pause your subscription for up to 3 months if needed due to injury or other circumstances.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Do you offer family discounts?</h4>
                <p className="text-gray-600">Yes! Get 15% off when you sign up 2 or more family members for any coaching plan.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What devices can I use?</h4>
                <p className="text-gray-600">Our training platform works on any device - smartphone, tablet, or computer. Compatible with popular running apps and GPS watches.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Money-Back Guarantee</h3>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">30-Day Risk-Free Trial</h4>
            </div>
            <p className="text-gray-600 mb-4">
              Try any coaching plan for 30 days. If you're not completely satisfied with your progress and experience, 
              we'll refund your first month - no questions asked.
            </p>
            <p className="text-gray-600">
              We're confident in our coaching approach and want you to feel the same way. Your success is our priority.
            </p>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Not Sure Which Plan to Choose?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Schedule a free 15-minute consultation to discuss your goals and find the perfect coaching plan.
          </p>
          <Link 
            href="/contact" 
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all inline-block"
          >
            Book Free Consultation
          </Link>
        </div>

        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Running?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join hundreds of runners who have achieved their goals with personalized coaching.
          </p>
          <Link 
            href="/contact" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all inline-block"
          >
            Start Your Journey Today
          </Link>
        </div>
      </main>
    </div>
  );
}