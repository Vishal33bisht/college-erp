"""initial schema

Revision ID: fc572bbf4e3a
Revises: 14e566142b01
Create Date: 2025-11-20 13:06:37.242340

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fc572bbf4e3a'
down_revision: Union[str, Sequence[str], None] = '14e566142b01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
