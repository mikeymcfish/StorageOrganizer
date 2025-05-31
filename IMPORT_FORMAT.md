# Import JSON Format

The import functionality only processes **items** from the JSON file. Categories and containers must be managed within the app.

## Required Format

```json
{
  "items": [
    {
      "id": 1,
      "name": "Item Name",
      "categoryId": 2,
      "size": "md",
      "quantity": 1,
      "information": "Optional description",
      "photo": null,
      "containerId": 1,
      "position": {
        "row": 0,
        "column": 3
      }
    }
  ]
}
```

## Field Descriptions

- **id** (optional): If provided, will update existing item with same ID. If omitted, creates new item with auto-generated ID.
- **name** (required): Item name
- **categoryId** (optional): Must match existing category ID in your app
- **size** (optional): Must match existing size option (xs, sm, md, lg, xl)
- **quantity** (required): Number of items
- **information** (optional): Additional description
- **photo** (optional): Currently not used
- **containerId** (required): Must match existing container ID in your app
- **position** (required): Grid position with row and column numbers

## Example Import File

```json
{
  "items": [
    {
      "name": "Arduino Uno",
      "categoryId": 2,
      "size": "sm",
      "quantity": 3,
      "information": "Microcontroller boards",
      "containerId": 1,
      "position": {"row": 0, "column": 0}
    },
    {
      "id": 5,
      "name": "Updated Screwdriver",
      "categoryId": 3,
      "size": "md",
      "quantity": 1,
      "information": "Phillips head",
      "containerId": 1,
      "position": {"row": 1, "column": 2}
    },
    {
      "name": "Programming Book",
      "categoryId": 4,
      "quantity": 1,
      "containerId": 2,
      "position": {"row": 0, "column": 1}
    }
  ]
}
```

## Import Results

After import, you'll receive a summary:
- **Imported**: New items created
- **Updated**: Existing items modified
- **Failed**: Items that couldn't be processed
- **Errors**: Specific error messages for failed items

## Notes

- Items with invalid categoryId or containerId will fail to import
- Items with duplicate positions will overwrite each other
- The app will automatically refresh to show imported changes