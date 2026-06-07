import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // timestamps agrega createdAt y updatedAt automaticamente
export class Publicacion extends Document {
  @Prop({ required: true })
  titulo: string;
 
  @Prop({ required: true })
  mensaje: string;

  @Prop({ default: null })
  imagenUrl: string | null; // opcional 

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId; // referencia al usuario autor

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  likes: Types.ObjectId[]; // array de IDs de usuarios que dieron like 

  @Prop({ default: true })
  activa: boolean; // baja lógica
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);