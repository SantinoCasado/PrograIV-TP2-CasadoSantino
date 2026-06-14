import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Multer } from 'multer';    // Multer es un middleware de Node.js para manejar multipart/form-data, que se utiliza principalmente para subir archivos. En este caso, se importa para definir el tipo de archivo que se espera recibir en el método uploadProfileImage.

@Injectable()
export class StorageService {
	private readonly supabaseUrl = process.env.SUPABASE_URL;
	private readonly supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	private readonly bucket = process.env.SUPABASE_BUCKET ?? 'imagenes-perfil';

    // Este readonly crea una instancia del cliente de Supabase utilizando las variables de entorno para la URL y la clave de servicio. Si alguna de estas variables no está configurada, supabase será null y se lanzará un error al intentar usarlo.
	private readonly supabase = this.supabaseUrl && this.supabaseServiceRoleKey
		? createClient(this.supabaseUrl, this.supabaseServiceRoleKey)
		: null;

    // El método uploadProfileImage se encarga de subir una imagen de perfil a Supabase. 
	async uploadProfileImage(file: Express.Multer.File): Promise<string> {  // El método recibe un archivo de tipo Express.Multer.File, que es el formato que Multer utiliza para manejar archivos subidos en las solicitudes HTTP.
		if (!file) {
			throw new BadRequestException('La imagen de perfil es obligatoria.');
		}

		if (!this.supabase) {   // Si el cliente de Supabase no está configurado correctamente, se lanza una excepción indicando que no se ha configurado.
			throw new InternalServerErrorException('Supabase no esta configurado en variables de entorno.');
		}

		const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']; // Se define los tipos MIME permitidos para las imagenes de perfil. Si el archivo subido no coincide con uno de estos tipos, se lanza una excepcion indicando que el formato no es permitido.
		if (!allowedMimeTypes.includes(file.mimetype)) {    // Se verifica si el tipo MIME del archivo subido está en la lista de tipos permitidos. Si no lo está, se lanza una excepción indicando que el formato de imagen no es permitido.
			throw new BadRequestException('Formato de imagen no permitido. Usa JPG, PNG o WEBP.');
		}

		const extension = this.getExtension(file.mimetype); // Se obtiene la extensión del archivo a partir de su tipo MIME utilizando el método getExtension. Este método mapea los tipos MIME a extensiones de archivo comunes (jpg, png, webp) y devuelve 'bin' para cualquier tipo no reconocido.
		const baseName = file.originalname.replace(/\.[^/.]+$/, '');    // Se genera un nombre de archivo seguro eliminando la extensión original y reemplazando cualquier carácter no alfanumérico, punto, guion o guion bajo con un guion bajo. Esto ayuda a evitar problemas con caracteres especiales en los nombres de archivo.
		const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');     // Se genera un nombre de archivo seguro reemplazando cualquier carácter que no sea una letra, número, punto, guion o guion bajo con un guion bajo. Esto ayuda a evitar problemas con caracteres especiales en los nombres de archivo.
		const filePath = `profiles/${Date.now()}-${safeName}.${extension}`; // Se genera una ruta de archivo única para la imagen de perfil utilizando un prefijo "profiles/", el timestamp actual (Date.now()) para garantizar unicidad, el nombre seguro del archivo y la extensión correspondiente. Esto ayuda a organizar las imágenes de perfil en una carpeta específica y evita colisiones de nombres.

        // Se intenta subir el archivo a Supabase utilizando el método upload del cliente de almacenamiento. Si ocurre un error durante la subida, se lanza una excepción indicando que hubo un error al subir la imagen a Supabase.
		const { error: uploadError } = await this.supabase.storage
			.from(this.bucket)
			.upload(filePath, file.buffer, {
				contentType: file.mimetype,
				upsert: false,
			});
        
        // Verifico si hubo un error durante la subida del archivo a Supabase. Si uploadError no es null, significa que ocurrió un error y se lanza una excepción indicando que hubo un error al subir la imagen a Supabase, incluyendo el mensaje de error específico.
		if (uploadError) {
			throw new InternalServerErrorException(`Error al subir imagen a Supabase: ${uploadError.message}`);
		}
        
		// Se obtiene la URL pública de la imagen subida a Supabase. Si no se puede generar la URL pública, se lanza una excepción indicando que no se pudo generar la URL pública de la imagen.
		const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(filePath);

        // Verifico si se pudo generar la URL pública de la imagen. Si data.publicUrl no existe, significa que no se pudo generar la URL pública y se lanza una excepción indicando que no se pudo generar la URL pública de la imagen.
		if (!data?.publicUrl) {
			throw new InternalServerErrorException('No se pudo generar la URL publica de la imagen.');
		}

		return data.publicUrl;
	}

	// -------------------------------------------------------------------------------
	// Funciones auxiliares para manejo de imágenes de publicaciones (similar a las de perfil pero con carpeta y validaciones específicas)
	async uploadPostImage(file: Express.Multer.File): Promise<string> {
		if (!this.supabase) {
			throw new InternalServerErrorException('Supabase no esta configurado en variables de entorno.');
		}

		const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException('Formato de imagen no permitido. Usa JPG, PNG o WEBP.');
		}

		const extension = this.getExtension(file.mimetype);
		const baseName = file.originalname.replace(/\.[^/.]+$/, '');
		const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
		const filePath = `posts/${Date.now()}-${safeName}.${extension}`; // misma lógica que profiles/ pero en carpeta posts/

		const { error: uploadError } = await this.supabase.storage
			.from(this.bucket)
			.upload(filePath, file.buffer, {
			contentType: file.mimetype,
			upsert: false,
			});

		if (uploadError) {
			throw new InternalServerErrorException(`Error al subir imagen a Supabase: ${uploadError.message}`);
		}

		const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(filePath);

		if (!data?.publicUrl) {
			throw new InternalServerErrorException('No se pudo generar la URL publica de la imagen.');
		}

		return data.publicUrl;
		}

    // El método getExtension es una función auxiliar que toma un tipo MIME como entrada y devuelve la extensión de archivo correspondiente. 
	private getExtension(mimetype: string): string {
		switch (mimetype) {
			case 'image/jpeg':
				return 'jpg';
			case 'image/png':
				return 'png';
			case 'image/webp':
				return 'webp';
			default:
				return 'bin';   // Si el tipo MIME no coincide con ninguno de los casos definidos, se devuelve 'bin' como extensión genérica para archivos binarios. 
		}
	}
}
