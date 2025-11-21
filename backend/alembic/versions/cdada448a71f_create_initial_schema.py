"""create initial schema

Revision ID: cdada448a71f
Revises: fc572bbf4e3a
Create Date: 2025-11-20 19:03:19.768888

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cdada448a71f'
down_revision: Union[str, Sequence[str], None] = 'fc572bbf4e3a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
