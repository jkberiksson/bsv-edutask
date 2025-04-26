import pytest
from pymongo.errors import WriteError
from unittest.mock import Mock, patch
from src.util.dao import DAO


@pytest.fixture
def dao():
    dao_instance = DAO("test_collection")
    yield dao_instance
    dao_instance.collection.delete_many({})


@pytest.mark.daocreate
def test_create_success_json_return(dao):
    doc = {"title": "test_name", "description": "test_description"}
    result = dao.create(doc)

    assert isinstance(
        result, dict) and "_id" in result and result["title"] == "test_name" and result["description"] == "test_description"


@pytest.mark.daocreate
def test_non_unique_title_raises_write_error(dao):
    doc = {"title": "test_name", "description": "test_description"}
    doc2 = {"title": "test_name", "description": "test_description2"}
    dao.create(doc)

    with pytest.raises(WriteError):
        dao.create(doc2)


@pytest.mark.daocreate
def test_bson_type_constraint_not_complied_with(dao):
    doc = {"title": 123, "description": "test_description"}

    with pytest.raises(WriteError):
        dao.create(doc)


@pytest.mark.daocreate
def test_does_not_contain_required_props(dao):
    doc = {"description": "test_description"}
    doc2 = {"title": "test_title"}

    with pytest.raises(WriteError):
        dao.create(doc)
    with pytest.raises(WriteError):
        dao.create(doc2)
