import { Type, type Static } from "@sinclair/typebox";
import tyex, { Options } from "../../../src";
import { Cat, Error } from "./dtos";

const router = tyex.Router();

const cats: Static<typeof Cat>[] = [
  { id: 1, name: "Whiskers", breed: "Persian", age: 5 },
  { id: 2, name: "Luna", breed: "Siamese", age: 3 },
];

router.get(
  "/",
  {
    summary: "Get all cats",
    parameters: [
      {
        in: "query",
        name: "limit",
        required: false,
        schema: Options(Type.Integer({ minimum: 1, maximum: 100 }), {
          default: 10,
        }),
      },
    ],
    responses: {
      200: {
        description: "A list of cats",
        content: {
          "application/json": {
            schema: Type.Array(Cat),
          },
        },
      },
    },
  },
  (req, res) => {
    const result = cats.slice(0, req.query.limit);
    res.json(result);
  },
);

router.get(
  "/:id",
  {
    summary: "Get a cat by ID",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: Type.Integer(),
      },
    ],
    responses: {
      200: {
        description: "Cat found",
        content: {
          "application/json": {
            schema: Cat,
          },
        },
      },
      404: {
        description: "Cat not found",
        content: {
          "application/json": {
            schema: Error,
          },
        },
      },
    },
  },
  (req, res) => {
    const cat = cats.find((c) => c.id === req.params.id);
    if (!cat) {
      res.status(404).json({ message: "Cat not found" });
      return;
    }
    res.json(cat);
  },
);

router.post(
  "/",
  {
    summary: "Create a new cat",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: Cat,
        },
      },
    },
    responses: {
      201: {
        description: "Cat created successfully",
        content: {
          "application/json": {
            schema: Cat,
          },
        },
      },
    },
  },
  (req, res) => {
    const newCat = {
      id: cats.length + 1,
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
    };

    cats.push(newCat);
    res.status(201).json(newCat);
  },
);

router.put(
  "/:id",
  {
    summary: "Update a cat",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: Type.Integer(),
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: Type.Omit(Cat, ["id"]),
        },
      },
    },
    responses: {
      200: {
        description: "Cat updated successfully",
        content: {
          "application/json": {
            schema: Cat,
          },
        },
      },
      404: {
        description: "Cat not found",
        content: {
          "application/json": {
            schema: Error,
          },
        },
      },
    },
  },
  (req, res) => {
    const cat = cats.find((c) => c.id === req.params.id);
    if (!cat) {
      res.status(404).json({ message: "Cat not found" });
      return;
    }

    cat.name = req.body.name;
    cat.breed = req.body.breed;
    cat.age = req.body.age;

    res.json(cat);
  },
);

router.delete(
  "/:id",
  {
    summary: "Delete a cat",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: Type.Integer(),
      },
    ],
    responses: {
      204: {
        description: "Cat deleted successfully",
      },
      404: {
        description: "Cat not found",
        content: {
          "application/json": {
            schema: Error,
          },
        },
      },
    },
  },
  (req, res) => {
    const catIndex = cats.findIndex((c) => c.id === req.params.id);
    if (catIndex === -1) {
      res.status(404).json({ message: "Cat not found" });
      return;
    }

    cats.splice(catIndex, 1);
    res.status(204).send();
  },
);

export default router;
