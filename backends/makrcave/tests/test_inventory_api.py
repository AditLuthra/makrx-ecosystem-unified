

import threading
import time
import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..crud.inventory import InventoryCRUD
from ..models.inventory import InventoryItem, InventoryItemCreate, InventoryItemUpdate
from ..schemas.inventory import InventoryFilter



@pytest.fixture(scope="module")
def db_session():
    # Use in-memory SQLite for isolation
    engine = create_engine("sqlite:///:memory:")
    from ..models import inventory as models
    models.Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    yield Session()

def test_makerspace_isolation(db_session):
    crud = InventoryCRUD(db_session)
    # Create items for two makerspaces
    item1 = InventoryItemCreate(
        name="Item1", quantity=10, min_threshold=2, created_by="user1", category=None, status=None, supplier_type=None, location=None, description=None, product_code=None, supplier=None, owner_user_id=None, linked_makerspace_id="ms1"
    )
    item2 = InventoryItemCreate(
        name="Item2", quantity=5, min_threshold=1, created_by="user2", category=None, status=None, supplier_type=None, location=None, description=None, product_code=None, supplier=None, owner_user_id=None, linked_makerspace_id="ms2"
    )
    crud.create_item(item1)
    crud.create_item(item2)
    # Query for ms1
    filter1 = InventoryFilter(makerspace_id="ms1", skip=0, limit=10)
    items1, _ = crud.get_items(filter1)
    assert all(i.linked_makerspace_id == "ms1" for i in items1)
    # Query for ms2
    filter2 = InventoryFilter(makerspace_id="ms2", skip=0, limit=10)
    items2, _ = crud.get_items(filter2)
    assert all(i.linked_makerspace_id == "ms2" for i in items2)



def test_concurrent_stock_updates(db_session):
    crud = InventoryCRUD(db_session)
    # Create an item
    item = InventoryItemCreate(
        name="ConcurrentItem", quantity=10, min_threshold=2, created_by="user1", category=None, status=None, supplier_type=None, location=None, description=None, product_code=None, supplier=None, owner_user_id=None, linked_makerspace_id="ms1"
    )
    db_item = crud.create_item(item)
    item_id = db_item.id

    def update_stock(delta):
        update = InventoryItemUpdate(quantity=db_item.quantity + delta, updated_by="user1")
        crud.update_item(item_id, update, makerspace_id="ms1")

    threads = [threading.Thread(target=update_stock, args=(d,)) for d in [1, -1]]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    # Reload item
    updated = crud.get_item(item_id, makerspace_id="ms1")
    # The final quantity should be either 11 or 9 depending on thread timing, but not fail
    assert updated.quantity in (9, 11)
