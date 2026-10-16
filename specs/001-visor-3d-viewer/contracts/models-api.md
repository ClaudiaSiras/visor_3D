# API Contract: Models Listing Endpoint

**Endpoint**: `GET /api/models.php`

**Purpose**: Returns a list of available 3D models in the `modelos/` folder for the carousel.

## Request

### Method
`GET`

### URL
`/api/models.php`

### Parameters
None

### Headers
None required

## Response

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success — returns model list |
| 500 | Server error — folder not readable |

### Response Body (200 OK)

```json
{
  "success": true,
  "models": [
    {
      "filename": "example-model.glb",
      "displayName": "example-model",
      "fileSize": 5242880,
      "fileSizeFormatted": "5.0 MB"
    }
  ],
  "count": 1
}
```

### Response Body (500 Error)

```json
{
  "success": false,
  "error": "Unable to read modelos/ folder"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Whether the request succeeded |
| models | array | Array of model objects |
| models[].filename | string | File name with extension |
| models[].displayName | string | Human-readable name (filename without extension) |
| models[].fileSize | number | File size in bytes |
| models[].fileSizeFormatted | string | Human-readable file size (e.g., "5.0 MB") |
| count | number | Total number of models |
| error | string | Error message (only on failure) |

## Validation Rules

1. Only files with `.glb` extension are included
2. Files larger than 10MB are excluded
3. Files are sorted alphabetically by filename
4. If `modelos/` folder is empty, returns empty array with `count: 0`
5. If `modelos/` folder doesn't exist or isn't readable, returns 500 error

## Example Usage

```javascript
fetch('/api/models.php')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log(`Found ${data.count} models`);
      data.models.forEach(model => {
        console.log(model.displayName);
      });
    } else {
      console.error(data.error);
    }
  });
```

## Notes

- This endpoint is read-only and has no side effects
- No authentication required (public endpoint)
- Response should be cached by the browser for performance
- Endpoint is compatible with shared hosting (PHP 7.4+)
