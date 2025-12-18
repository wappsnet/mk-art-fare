# Custom Fields System - Setup Checklist

## ✅ Backend Setup (Complete)

All backend files are created and routes are registered. No additional steps needed!

## 📦 Frontend Dependencies

Install the required dependency for rich text editing:

```bash
cd frontend
npm install react-quill @types/react-quill
```

## 🎯 Integration Steps

### 1. Add Route for Custom Fields Management Page

Add to your router configuration (e.g., `App.tsx` or router file):

```typescript
import { CustomFieldsPage } from '@/pages/dashboard/CustomFieldsPage';

// Add this route to your dashboard routes:
<Route path="/dashboard/:id/custom-fields" element={<CustomFieldsPage />} />
```

### 2. Add Navigation Link in Dashboard

Add a link to the Custom Fields page in your dashboard navigation:

```typescript
<Link to={`/dashboard/${orgId}/custom-fields`}>
  Custom Fields
</Link>
```

### 3. Product Form Integration (Already Done!)

The product form (`ShopProductsPage`) has been updated with:
- Field group selector
- Dynamic custom field rendering
- Automatic save/load of custom field values

## 🚀 Usage Flow

### For Admins/Artists:

1. **Navigate to Custom Fields** (`/dashboard/{orgId}/custom-fields`)
2. **Click "New Field Group"**
   - Name: "Artwork Details" (for example)
   - Description: "Custom fields for artwork products"
3. **Click "Manage Fields"** on the created group
4. **Add Fields**: Click "Add Field" and configure:
   - Label, field name, type
   - Validation rules
   - Options (for select/radio/checkbox)
   - Searchable/Filterable flags
5. **In Product Form**:
   - Select field groups from dropdown
   - Fill in custom field values
   - Save product

### For Customers:

Custom fields automatically appear on product detail pages!

## 📋 Quick Test

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the Flow**:
   - Login as artist/admin
   - Navigate to Custom Fields page
   - Create a field group: "Test Fields"
   - Add a text field: "Test Field"
   - Go to Products page
   - Create/Edit a product
   - Select "Test Fields" group
   - See "Test Field" appear in form
   - Fill it in and save
   - View product to see custom field displayed

## 🔧 API Testing (Optional)

Test the API endpoints using curl or Postman:

```bash
# Get field groups
curl http://localhost:5000/api/field-groups?organizationId=1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create field group
curl -X POST http://localhost:5000/api/field-groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Group",
    "description": "Test description",
    "organizationId": 1
  }'
```

## 🎨 Example Field Configurations

### Art Gallery Example

**Field Group: "Artwork Details"**

1. **Medium** (Select)
   - Options: Oil, Acrylic, Watercolor, Mixed Media
   - Required: Yes
   - Filterable: Yes

2. **Dimensions** (Text)
   - Placeholder: "24 x 36 inches"
   - Required: Yes

3. **Year Created** (Number)
   - Min: 1900, Max: 2025
   - Filterable: Yes

4. **Is Framed** (Toggle)
   - Filterable: Yes

5. **Artist Statement** (Rich Text)
   - Searchable: Yes

### Clothing Store Example

**Field Group: "Clothing Specs"**

1. **Size** (Select)
   - Options: XS, S, M, L, XL, XXL
   - Required: Yes
   - Filterable: Yes

2. **Color** (Select)
   - Options: Black, White, Blue, Red
   - Required: Yes
   - Filterable: Yes

3. **Material** (Text)
   - Placeholder: "e.g., 100% Cotton"
   - Required: Yes

4. **Care Instructions** (Rich Text)
   - Searchable: No

## ⚠️ Important Notes

1. **Rich Text Editor**: Requires `react-quill` - install before using rich text fields
2. **File Uploads**: Current implementation uses placeholder. Integrate with your upload service
3. **Conditional Logic**: Backend supports it, UI builder coming in future update
4. **Product Filters**: Search service ready, frontend filter UI coming soon

## 🐛 Troubleshooting

**"Cannot find module 'react-quill'"**
- Solution: Run `npm install react-quill @types/react-quill`

**Custom fields not showing in product form**
- Check: Field group created and has fields?
- Check: Fields are marked as active?
- Check: Field group selected in product form?

**API 404 errors**
- Check: Backend server is running?
- Check: Routes registered in `app.js`?
- Check: Database migration ran successfully?

**Custom field values not saving**
- Check: Browser console for errors
- Check: Backend logs for validation errors
- Check: Field values match field types (number for number fields, etc.)

## 🎉 You're Ready!

The custom fields system is fully integrated and ready to use. Start creating field groups and enhancing your products with custom data!

---

**Need Help?** Check `CUSTOM_FIELDS_IMPLEMENTATION.md` for detailed documentation.
