"""merge migration heads

Revision ID: 799559651a1c
Revises: 3b594d3b7cd5, d73cbe821b85
Create Date: 2025-11-21 17:14:52.130657

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '799559651a1c'
down_revision: Union[str, Sequence[str], None] = ('3b594d3b7cd5', 'd73cbe821b85')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
