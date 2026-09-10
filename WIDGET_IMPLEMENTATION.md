# Widget Implementation Guide

## Overview

The FinoTicket customer widget is a fully functional, embeddable support interface that allows customers to create tickets, view their ticket history, and communicate with support agents in real-time.

## Features

### Multi-View State Machine

The widget implements a complete state machine with four main views:

1. **Home** - Entry point with options to create new ticket or view existing tickets
2. **New Ticket** - Form to create support tickets with subject, description, category, topic, and attachments
3. **My Tickets** - List of customer's tickets with status badges
4. **Conversation** - Real-time message thread with agent responses

### Mock Token System

The widget uses a mock JWT token system for educational purposes, demonstrating:

- **Token Claims**: tenant_id, product_id, customer_id, scopes, expires_at, jti
- **Token Expiration**: Automatic expiration checking with refresh capability
- **Security**: No client secrets exposed in browser (educational demo)
- **Scopes**: tickets:create, tickets:read, tickets:reply

### Theming & Branding

The widget automatically applies product branding:

- **Primary Color**: Applied to header, buttons, and customer messages
- **Logo**: Optional logo URL from product settings
- **Title**: Custom widget title
- **Welcome Text**: Customizable welcome message

### File Attachments

Full attachment support with validation:

- **Max Files**: 5 files per ticket
- **Max Size**: 5MB per file
- **Allowed Types**: Images, PDF, Word documents
- **Preview**: File name, size, and download links
- **Upload**: Drag-and-drop or file picker

### Internationalization

Full bilingual support:

- **Persian (fa)**: Default language with RTL layout
- **English (en)**: LTR layout
- **All UI text**: Translated for both languages
- **Date/Time**: Locale-aware formatting

## Usage

### Basic Usage

```typescript
// Navigate to widget
#/widget
```

### With Product Parameter

```typescript
// Specify product
#/widget?product=p-001
```

### Mock Customer

The widget uses a mock customer for demonstration:

```typescript
{
  customer_id: 'c-001',
  customer_name: 'سارا احمدی',
  tenant_id: 'ten-1',
  product_id: 'p-001'
}
```

## Implementation Details

### State Management

```typescript
type Screen = 'home' | 'new' | 'list' | 'conversation';

const [screen, setScreen] = useState<Screen>('home');
const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
```

### Token Management

```typescript
interface MockToken {
  tenant_id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  scopes: string[];
  expires_at: string;
  jti: string;
  iat: number;
}

// Automatic expiration checking
useEffect(() => {
  const checkExpiration = () => {
    const expiresAt = new Date(mockToken.expires_at).getTime();
    const now = Date.now();
    setTokenExpired(now >= expiresAt);
  };
  
  checkExpiration();
  const interval = setInterval(checkExpiration, 1000);
  return () => clearInterval(interval);
}, []);
```

### Ticket Creation

```typescript
const handleCreateTicket = () => {
  const newTicket = mockStore.createTicket({
    tenant_id: mockToken.tenant_id,
    product_id: product.id,
    customer_id: mockToken.customer_id,
    subject,
    description,
    category_id: categoryId || undefined,
    topic_id: topicId || undefined,
    channel: 'WIDGET',
    source: 'widget',
    status: 'OPEN',
    priority: 'NORMAL',
  });

  // Add initial message
  mockStore.addMessage({
    ticket_id: newTicket.id,
    sender_type: 'CUSTOMER',
    sender_id: mockToken.customer_id,
    body: description,
    attachments: pendingAttachments.map(file => ({
      id: `att-${Date.now()}-${Math.random()}`,
      filename: file.name,
      mime_type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    })),
  });
};
```

### Message Sending

```typescript
const handleSendMessage = () => {
  mockStore.addMessage({
    ticket_id: selectedTicketId,
    sender_type: 'CUSTOMER',
    sender_id: mockToken.customer_id,
    sender_name: mockToken.customer_name,
    body: message,
    is_internal: false,
    channel: 'WIDGET',
  });
};
```

## UI Components

### Header

- Product logo and title
- Token info button (educational)
- Home navigation button
- Branded with product primary color

### Token Panel

- Collapsible educational panel
- Shows token claims (tenant_id, product_id, customer_id, scopes, expires_at)
- Token expiration warning
- Refresh token button (mock)

### Home View

- New Ticket button (branded)
- My Tickets button
- Clean, minimal design

### New Ticket Form

- Subject input (required)
- Description textarea (required)
- Category select (optional)
- Topic select (optional, filtered by category)
- File attachments with validation
- Submit button (branded)

### My Tickets List

- Ticket count
- Empty state when no tickets
- Ticket cards with:
  - Ticket number
  - Status badge (color-coded)
  - Subject
  - Creation date
- Click to open conversation

### Conversation View

- Back button to ticket list
- Ticket number and status badge
- Subject
- Message thread (scrollable)
  - Customer messages (branded background)
  - Agent messages (neutral background)
  - Timestamps
  - Attachment links
- Reply input with Enter key support
- Send button (branded)

## File Structure

```
src/pages/widget/
└── WidgetPage.tsx          # Main widget component
```

## Dependencies

- React 18+
- React Router (useSearchParams)
- Lucide React (icons)
- Tailwind CSS (styling)
- MockStore (data management)
- UI Components (Button, Input, Textarea, Select, Badge, FileUpload)

## Styling

The widget uses Tailwind CSS with custom theming:

```typescript
// Dynamic branding
style={{ backgroundColor: branding.primary_color }}

// Responsive design
className="w-full max-w-[380px]"

// Smooth transitions
className="transition-colors"
```

## Accessibility

- Keyboard navigation support
- Enter key to send messages
- Focus management
- Semantic HTML
- ARIA labels (where needed)

## Performance

- Efficient state management with React hooks
- Optimized re-renders with proper dependency arrays
- Lazy loading of attachments
- Efficient message rendering

## Security Considerations

### Current Implementation (Educational)

- Mock token system (no real JWT)
- No real authentication
- No real API calls
- No client secrets exposed

### Production Considerations

For production deployment:

1. **Real JWT Tokens**: Implement proper JWT signing/verification
2. **Token Refresh**: Implement refresh token flow
3. **API Authentication**: Secure API endpoints with token validation
4. **CORS**: Configure proper CORS policies
5. **Rate Limiting**: Implement rate limiting for API calls
6. **Input Validation**: Server-side validation of all inputs
7. **File Upload Security**: Virus scanning, size limits, type validation
8. **XSS Protection**: Sanitize all user inputs
9. **CSRF Protection**: Implement CSRF tokens
10. **Audit Logging**: Log all widget actions

## Testing

### Manual Testing Checklist

- [ ] Create new ticket with all fields
- [ ] Create ticket with attachments
- [ ] View ticket list
- [ ] Open ticket conversation
- [ ] Send message in conversation
- [ ] View attachments in messages
- [ ] Test token expiration
- [ ] Test token refresh
- [ ] Test with different products
- [ ] Test bilingual support (fa/en)
- [ ] Test responsive design
- [ ] Test keyboard navigation

### Automated Testing

```typescript
// Example test structure
describe('WidgetPage', () => {
  it('should render home view', () => {
    render(<WidgetPage />);
    expect(screen.getByText('تیکت جدید')).toBeInTheDocument();
  });

  it('should create ticket', () => {
    render(<WidgetPage />);
    fireEvent.click(screen.getByText('تیکت جدید'));
    fireEvent.change(screen.getByLabelText('موضوع'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('ثبت تیکت'));
    expect(mockStore.createTicket).toHaveBeenCalled();
  });
});
```

## Future Enhancements

### Planned Features

1. **Real-time Updates**: WebSocket for live message updates
2. **Typing Indicators**: Show when agent is typing
3. **Read Receipts**: Show when messages are read
4. **File Preview**: Inline image preview
5. **Emoji Support**: Emoji picker for messages
6. **Markdown Support**: Rich text formatting
7. **Ticket Rating**: Customer satisfaction rating
8. **Callback Request**: Request agent callback
9. **FAQ Integration**: Show relevant FAQs
10. **Offline Support**: Service worker for offline capability

### Embeddable SDK

Future plan to create embeddable SDK:

```html
<!-- Embed script -->
<script src="https://cdn.finoticket.com/widget.js"></script>
<script>
  FinoTicket.init({
    product: 'p-001',
    token: 'eyJhbGc...',
    theme: {
      primaryColor: '#0B7C8C',
      logo: 'https://example.com/logo.png'
    }
  });
</script>
```

## Troubleshooting

### Common Issues

**Issue**: Widget not loading
- **Solution**: Check product ID in URL parameter

**Issue**: Token expired
- **Solution**: Click "Refresh Token" button

**Issue**: Attachments not uploading
- **Solution**: Check file size (< 5MB) and type (image/pdf/doc)

**Issue**: Messages not sending
- **Solution**: Check token expiration and network connection

**Issue**: Styling not applied
- **Solution**: Check product widget_branding settings

## Support

For issues or questions:

- GitHub Issues: https://github.com/mojtba-allam/FinoTicket-V1-Frontend-Implementation/issues
- Documentation: See FINOTICKET_UI_UX_CHUNK_07_WIDGET_UX.md

## License

Part of FinoTicket V1 Frontend Implementation.
