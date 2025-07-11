# Phase 3 Features Testing Guide

## 🧪 Manual Testing Checklist

### ✅ **Subscription Management**

#### Test Routes:
- [ ] `/subscriptions/index` - Subscription plans page
- [ ] `/analytics/index` - Analytics dashboard  
- [ ] `/saved-searches/index` - Saved searches management

#### Profile Navigation:
- [ ] Profile → Subscription (for users)
- [ ] Profile → Saved Searches (for users)  
- [ ] Profile → Analytics (for users)

#### Subscription Plans:
- [ ] View Basic Plan (K50/month, 3 saved searches)
- [ ] View Premium Plan (K120/month, 15 saved searches, advanced filters, analytics)
- [ ] View Enterprise Plan (K250/month, unlimited searches, all features)
- [ ] Plan selection redirects to payment page
- [ ] Current plan shows "Current" badge

#### Premium Feature Guards:
- [ ] Advanced filters show upgrade prompts for non-premium users
- [ ] Amenity filtering requires Premium subscription
- [ ] Legal status filtering requires Premium subscription
- [ ] Analytics page shows upgrade prompt for non-premium users

### ✅ **Analytics Dashboard**

#### Statistics Cards:
- [ ] Property Views count
- [ ] Saved Properties count  
- [ ] Contacts Made count
- [ ] Searches count
- [ ] Unique Properties Viewed count

#### Activity Feed:
- [ ] Recent activity shows user actions
- [ ] Activity items show correct icons
- [ ] Activity dates display properly

#### Premium Access:
- [ ] Analytics only accessible to Premium+ subscribers
- [ ] Non-premium users see upgrade prompt

### ✅ **Saved Searches**

#### Search Management:
- [ ] View all saved searches
- [ ] Delete saved searches
- [ ] Toggle searches active/inactive
- [ ] Run saved search (redirects to explore)
- [ ] Search criteria display formatted correctly

#### Usage Limits:
- [ ] Basic: 3 saved searches max
- [ ] Premium: 15 saved searches max  
- [ ] Enterprise: Unlimited saved searches
- [ ] Limit reached shows upgrade prompt

#### Search Details:
- [ ] Search name display
- [ ] Search criteria formatting (location, price, beds/baths)
- [ ] Creation date
- [ ] Active/inactive status

### ✅ **UI/UX Components**

#### Subscription Cards:
- [ ] Plan features list correctly
- [ ] Price display (K50, K120, K250)
- [ ] Color coding by plan type
- [ ] Current plan indication
- [ ] Feature availability icons

#### Premium Guards:
- [ ] Elegant upgrade prompts
- [ ] Clear feature descriptions
- [ ] Direct links to subscription page
- [ ] Proper fallback content

#### Loading & Error States:
- [ ] Loading spinners display
- [ ] Error messages show appropriately
- [ ] Refresh controls work
- [ ] Empty states show helpful messages

## 🔧 **Backend Integration Tests**

### API Endpoints:
- [ ] `GET /subscriptions/plans` - Fetch subscription plans
- [ ] `GET /subscriptions/active` - Get user's active subscription
- [ ] `GET /analytics/user-stats` - Fetch user analytics
- [ ] `GET /saved-searches` - Fetch user's saved searches
- [ ] `POST /saved-searches` - Create new saved search
- [ ] `PUT /saved-searches/:id` - Update saved search
- [ ] `DELETE /saved-searches/:id` - Delete saved search

### Authentication:
- [ ] All protected routes require valid JWT token
- [ ] Unauthorized requests return 401
- [ ] User role-based access control works

### Data Validation:
- [ ] Subscription limits enforced
- [ ] Premium feature access validated
- [ ] User data isolation (RLS)

## 🎯 **Key Integration Points**

### Property Search:
- [ ] Advanced filters integrate with subscription status
- [ ] Save search functionality respects usage limits
- [ ] Premium users can access all filter options

### Profile Management:
- [ ] Subscription status displays correctly
- [ ] Navigation to premium features works
- [ ] User role affects available options

### Payment Flow:
- [ ] Subscription selection flows to payment
- [ ] Payment success updates subscription status
- [ ] Features unlock after successful payment

## 🔄 **Expected Behavior**

### For Free Users:
- Limited to basic property search
- Can save up to 3 searches (Basic subscription)
- No access to analytics
- Upgrade prompts for premium features

### For Premium Users (K120/month):
- Advanced filtering capabilities
- Up to 15 saved searches
- Analytics dashboard access
- Priority notifications

### For Enterprise Users (K250/month):
- All premium features
- Unlimited saved searches
- Full analytics access
- Bulk operations

## 🐛 **Common Issues to Check**

- [ ] TypeScript routing errors resolved
- [ ] Component imports work correctly
- [ ] Navigation stack includes new routes
- [ ] Subscription state updates properly
- [ ] Analytics data loads correctly
- [ ] Feature guards work as expected

## 📱 **Testing Platforms**

- [ ] iOS Simulator
- [ ] Android Emulator  
- [ ] Expo Web
- [ ] Physical devices

---

**Note**: This implementation provides a complete premium subscription system for the Zambian real estate market with proper feature gating, analytics, and subscription management.