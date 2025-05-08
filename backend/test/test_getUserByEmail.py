import pytest
from src.controllers.usercontroller import UserController
from unittest.mock import MagicMock

@pytest.fixture
def user_controller():
    mock_dao = MagicMock()
    return UserController(dao=mock_dao)

@pytest.mark.getuserbyemail
def test_returns_none_when_zero_users_found(user_controller):
    user_controller.dao.find.return_value = []

    result = user_controller.get_user_by_email("nonexistent@example.com")

    assert result is None

@pytest.mark.getuserbyemail
def test_prints_warning_when_zero_users_found(user_controller, capsys):
    user_controller.dao.find.return_value = []

    user_controller.get_user_by_email("nonexistent@example.com")
    captured = capsys.readouterr()

    assert "Warning: no user found with mail nonexistent@example.com" in captured.out

@pytest.mark.getuserbyemail
def test_valid_email_matches_one_user_returns_userobject(user_controller):
    mocked_user = {"email": "existing@email.com"}
    user_controller.dao.find.return_value = [mocked_user]

    result = user_controller.get_user_by_email("existing@email.com")

    assert result == mocked_user

@pytest.mark.getuserbyemail
def test_returns_first_user_when_multiple_users_found(user_controller):
    mocked_user1 = {"email": "existingmultiple@email.com", "id": "1"}
    mocked_user2 = {"email": "existingmultiple@email.com", "id": "2"}
    user_controller.dao.find.return_value = [mocked_user1, mocked_user2]

    result = user_controller.get_user_by_email("existingmultiple@email.com")

    assert result == mocked_user1


@pytest.mark.getuserbyemail
def test_prints_warning_when_multiple_users_found(user_controller, capsys):
    mocked_user1 = {"email": "existingmultiple@email.com", "id": "1"}
    mocked_user2 = {"email": "existingmultiple@email.com", "id": "2"}
    user_controller.dao.find.return_value = [mocked_user1, mocked_user2]

    user_controller.get_user_by_email("existingmultiple@email.com")
    captured = capsys.readouterr()

    assert "Error: more than one user found with mail existingmultiple@email.com" in captured.out


@pytest.mark.getuserbyemail
def test_valid_email_db_operation_fails_raises_exception(user_controller):
    user_controller.dao.find.side_effect = Exception("Database error")

    with pytest.raises(Exception) as excinfo:
        user_controller.get_user_by_email("existing@email.com")
    assert str(excinfo.value) == "Database error"

@pytest.mark.getuserbyemail
@pytest.mark.parametrize("invalid_email_cases", ["", "invalidemail", "invalid@domain", "invalid@domain."])
def test_invalid_email_raises_value_error(user_controller, invalid_email_cases):
    with pytest.raises(ValueError) as excinfo:
        user_controller.get_user_by_email(invalid_email_cases)
    assert str(excinfo.value) == "Error: invalid email address"
