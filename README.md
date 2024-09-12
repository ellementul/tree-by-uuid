# Tree Data by UUIDs

## Description
This is structure data for decentralization, tree is building by bites of uuid

### Peer synchronization
Synchronization with full copy of data by sub-trees

### Frame synchronization
One DB copy part of data from other DB
Part data is data frame

One DB can have many frames from many DBs

A Frame can be "read only" and "write only"

## Using
### As class
```js
import { TreeByUuid } from "@ellementul/tree-by-uuid"

const storage = new TreeByUuid
```
#### Get item
If object doesn't exist then return "undefined"
```js
const object = storage.get(uuid)
```

#### Upsert item
Add item or update.
If item exist, it will compare old version and new version of object, and then update.
If old version and new version is not comparable, then it return new uuid of created item with your version
Version is hash of prev version + prev hash of data + new hash of data

```js
const { uuid, version } = storage.upsert({
    uuid,
    hash,
    version,
    data
})
```

#### Remove item
If object doesn't exist then return "undefined"
```js
const { uuid, version } = storage.remove(uuid)
```

#### Check sector
#### Delete item

### As Member
