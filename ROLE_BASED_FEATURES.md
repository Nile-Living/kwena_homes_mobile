# 🎯 Role-Based Premium Features Distribution

## 👤 **Regular Users (Property Seekers)**

### **Basic User Plan - K50/month**
- ✅ **3 Saved Searches**: Keep track of preferred search criteria
- ✅ **Basic Property Alerts**: Get notified of new properties (not priority)
- ✅ **Basic Search Filters**: Standard property type, price, beds/baths
- ❌ Advanced amenity filtering
- ❌ Analytics dashboard
- ❌ Priority notifications

### **Premium User Plan - K120/month**
- ✅ **15 Saved Searches**: Enhanced search management
- ✅ **Priority Notifications**: Get notified first about new properties
- ✅ **Advanced Filters**: Amenities, legal status, detailed criteria
- ✅ **Property Alerts**: Enhanced alert system
- ✅ **Personal Analytics**: Track your viewing and search behavior
- ✅ **Search History**: View your property search patterns

### **User Analytics Dashboard Includes:**
- Properties viewed count
- Saved properties count
- Contacts made to agents
- Searches performed
- Unique properties viewed
- Recent activity timeline
- Top properties you've viewed

---

## 🏢 **Agents (Property Listers)**

### **Basic Agent Plan - K150/month**
- ✅ **10 Saved Searches**: Monitor market trends
- ✅ **Property Analytics**: Basic performance metrics for listings
- ✅ **Lead Tracking**: Track inquiries and contacts
- ✅ **Advanced Filters**: Full filtering capabilities
- ✅ **Priority Notifications**: Get market updates first
- ✅ **Business Insights**: Basic analytics access

### **Professional Agent Plan - K300/month**
- ✅ **50 Saved Searches**: Comprehensive market monitoring
- ✅ **Enhanced Property Analytics**: Detailed performance metrics
- ✅ **Lead Management**: Advanced lead tracking and analytics
- ✅ **Market Insights**: Competitor analysis and trends
- ✅ **Promotion Tools**: Enhanced property promotion features
- ✅ **Business Dashboard**: Comprehensive business analytics

### **Agency Enterprise Plan - K500/month**
- ✅ **Unlimited Saved Searches**: No limits on market monitoring
- ✅ **Full Analytics Suite**: Complete business intelligence
- ✅ **Team Management**: Multi-agent account management
- ✅ **Bulk Operations**: Mass property management tools
- ✅ **API Access**: Integration with external systems
- ✅ **White-label Options**: Custom branding capabilities

### **Agent Analytics Dashboard Includes:**
- Total property views on their listings
- Properties saved by users
- Leads generated from listings
- Active property listings count
- Property performance metrics
- Lead conversion rates
- Market trend analysis
- Top performing properties

---

## 🔧 **Feature Access Logic**

### **Analytics Access Rules:**
- **Regular Users**: Need Premium subscription (K120+)
- **Agents**: Get analytics with ANY subscription (K150+)
- **Unsubscribed Agents**: Still get basic analytics access
- **Unsubscribed Users**: No analytics access

### **Advanced Filters:**
- **Regular Users**: Premium subscription required
- **Agents**: Included in all plans (needed for business)

### **Saved Searches Limits:**
- **Free Users**: 0 saved searches
- **Basic Users**: 3 saved searches
- **Premium Users**: 15 saved searches
- **Basic Agents**: 10 saved searches
- **Professional Agents**: 50 saved searches
- **Enterprise Agents**: Unlimited

### **Priority Notifications:**
- **Regular Users**: Premium subscription required
- **Agents**: Included in all plans

---

## 📱 **Profile Navigation Structure**

### **For Regular Users:**
```
Profile Menu:
├── Edit Profile
├── Saved Properties
├── Subscription (User Plans)
├── Saved Searches
├── My Activity Analytics (Premium only)
└── Settings
```

### **For Agents:**
```
Profile Menu:
├── My Properties
├── My Promoted Properties
├── Add Property
├── Property Analytics (Always available)
├── Agent Subscription (Agent Plans)
└── Settings
```

---

## 🎯 **Business Value Proposition**

### **For Regular Users:**
- **Basic**: Affordable entry point for casual property searching
- **Premium**: Comprehensive tools for serious property seekers with analytics to track their search behavior

### **For Agents:**
- **Basic Agent**: Essential tools for new agents to manage listings and track basic performance
- **Professional Agent**: Advanced tools for established agents with detailed business insights
- **Agency Enterprise**: Full suite for agencies and top-performing agents with team management

---

## 🔄 **Implementation Details**

### **Role Detection:**
```typescript
const isAgent = user?.user_metadata?.role === 'agent' || user?.app_metadata?.role === 'agent';
```

### **Feature Access Control:**
```typescript
// Analytics access logic
if (feature === 'analytics_access') {
  return isAgent ? true : (features.analytics_access || false);
}
```

### **API Endpoints:**
- **User Analytics**: `GET /analytics/user-stats`
- **Agent Analytics**: `GET /analytics/agent-stats`
- **Role-specific subscription plans**: Different plan arrays based on user role

### **Subscription Plans API:**
- Users see: Basic User (K50), Premium User (K120)
- Agents see: Basic Agent (K150), Professional Agent (K300), Agency Enterprise (K500)

---

## 💰 **Pricing Strategy**

### **User Pricing (Property Seekers):**
- Focused on search enhancement and personal tracking
- Lower price point to encourage adoption
- Analytics as premium feature to drive upgrades

### **Agent Pricing (Business Users):**
- Higher price point reflecting business value
- Analytics included as essential business tool
- Graduated pricing based on business scale

This role-based approach ensures that:
1. **Users** get features focused on property search enhancement
2. **Agents** get business tools essential for their work
3. **Pricing** reflects the value provided to each user type
4. **Analytics** are positioned appropriately for each role