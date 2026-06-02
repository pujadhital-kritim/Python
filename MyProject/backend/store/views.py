from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly,IsAdminUser
from .models import Product
from .serializers import ProductSerializer

#List all products
class ProductListView(APIView):
    #anyone can view product only admin can create
    permission_classes = [IsAuthenticatedOrReadOnly]


    #GET api/products/  list all products
    def get(self,request):
        products= Product.objects.all().order_by('created_at')


       # search by name
        search = request.query_params.get('search')
        if search:
            products = products.filter(name_icontains=search)


        # filter by tag 
        tag = request.query_params.get('tag')
        if tag:
            products = products.filter(tag__icontains=tag)

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    


    # create a new product > admin only

    def post(self,request):
        if not request.user.is_staff:
            return Response(
                {"error" : "only admin ccan add products"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



    
class ProductDetailView(APIView):
    permission_classes= [IsAuthenticatedOrReadOnly]


    ## get product or 404 return
    def get_object(self,pk):
        try:
            return Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return None


    # get single product  
    def get(self,request,pk):
        product = self.get_object(pk)
        if not product:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    

    #update 
    def put(self, request, pk):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admin can update products."},
                status=status.HTTP_403_FORBIDDEN
            )
        product = self.get_object(pk)
        if not product:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProductSerializer(
            product, data=request.data,
            partial=True,                    
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    # DELETE
    def delete(self, request, pk):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admin can delete products."},
                status=status.HTTP_403_FORBIDDEN
            )
        product = self.get_object(pk)
        if not product:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        product.delete()
        return Response(
            {"message": "Product deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
