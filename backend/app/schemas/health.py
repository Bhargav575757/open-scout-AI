from pydantic import BaseModel, Field


class RootResponse(BaseModel):
    message: str = Field(
        ...,
        description="Welcome message from the root endpoint",
        examples=["Welcome to OpenScout API"],
    )


class HealthResponse(BaseModel):
    status: str = Field(
        ...,
        description="Health status of the service",
        examples=["healthy"],
    )
    service: str = Field(
        ...,
        description="Identifier of the service",
        examples=["OpenScout Backend"],
    )
