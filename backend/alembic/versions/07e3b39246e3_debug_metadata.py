"""debug metadata

Revision ID: 07e3b39246e3
Revises: cdada448a71f
Create Date: 2025-11-20 19:10:55.246601

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '07e3b39246e3'
down_revision: Union[str, Sequence[str], None] = 'cdada448a71f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "enrollments",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["student_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["course_id"],
            ["courses.id"],
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("student_id", "course_id", name="uq_student_course"),
    )

    pass


def downgrade() -> None:
    op.drop_table("enrollments")
    pass
